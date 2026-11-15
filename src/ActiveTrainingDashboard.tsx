import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  addReadingResult,
  getReadingResults,
  updateBook,
  type Book,
  type ReadingResult,
  type Training,
} from './mockApi';
import {
  formatDate,
  formatDateLabel,
  formatTime,
  getCalendarDays,
  getCountdown,
  getEndOfDay,
  getLocalDateString,
  parseLocalDate,
} from './dateUtils';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

type Props = {
  training: Training;
  books: Book[];
  onBooksChange: (books: Book[]) => void;
};

function TimerCard({ title, target, now }: { title: string; target: Date | null; now: Date }) {
  const countdown = target ? getCountdown(target, now) : null;

  return (
    <section className="timer-card" aria-label={title}>
      <h2>{title}</h2>
      {countdown ? (
        countdown.expired ? (
          <p className="timer-expired">Час завершився</p>
        ) : (
          <div className="timer-values">
            {[
              [countdown.days, 'днів'],
              [countdown.hours, 'годин'],
              [countdown.minutes, 'хвилин'],
            ].map(([value, label]) => (
              <div className="timer-unit" key={label}>
                <strong>{String(value).padStart(2, '0')}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )
      ) : (
        <p className="timer-expired">Дату завершення не задано</p>
      )}
    </section>
  );
}

export default function ActiveTrainingDashboard({ training, books, onBooksChange }: Props) {
  const [results, setResults] = useState<ReadingResult[]>(() => getReadingResults(training.id));
  const [now, setNow] = useState(() => new Date());
  const [resultDate, setResultDate] = useState(() => getLocalDateString(new Date()));
  const [resultTime, setResultTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [pages, setPages] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ratingQueue, setRatingQueue] = useState<Book[]>([]);
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const trainingBooks = useMemo(
    () =>
      training.bookIds
        .map((id) => books.find((book) => book.id === id))
        .filter((book): book is Book => !!book),
    [books, training.bookIds],
  );
  const totalPages = trainingBooks.reduce((total, book) => total + book.totalPages, 0);
  const pagesRead = results.reduce((total, result) => total + result.pages, 0);
  const remainingPages = Math.max(0, totalPages - pagesRead);
  const today = getLocalDateString(now);
  const maxResultDate = training.endDate < today ? training.endDate : today;
  const validStart = parseLocalDate(training.startDate);
  const validEnd = getEndOfDay(training.endDate);
  const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

  const chartData = useMemo(() => {
    const days = getCalendarDays(training.startDate, training.endDate);
    const dayPositions = new Map(days.map((day, index) => [day, index]));
    let accumulated = 0;
    const pagesByTime = new Map<number, number>();
    for (const result of results) {
      const dayIndex = dayPositions.get(result.date);
      if (dayIndex === undefined) continue;

      const time = result.time ?? new Date(result.createdAt).toTimeString().slice(0, 5);
      const [hours, minutes] = time.split(':').map(Number);
      const position = dayIndex * 24 + hours + minutes / 60;
      pagesByTime.set(position, (pagesByTime.get(position) ?? 0) + result.pages);
    }

    const actualPoints = [...pagesByTime]
      .sort(([left], [right]) => left - right)
      .map(([x, pages]) => {
        accumulated += pages;
        return { x, y: accumulated };
      });
    const totalHours = days.length * 24;
    const firstReading = actualPoints[0]?.x;
    const lastReading = actualPoints.at(-1)?.x;
    const readingSpan =
      firstReading !== undefined && lastReading !== undefined
        ? lastReading - firstReading
        : totalHours;
    const focused = actualPoints.length > 0 && readingSpan < 7 * 24;
    let xMin = 0;
    let xMax = totalHours;

    if (focused && firstReading !== undefined && lastReading !== undefined) {
      const visibleRange = Math.min(totalHours, Math.max(24, readingSpan + 6));
      const center = (firstReading + lastReading) / 2;
      xMin = Math.max(0, Math.min(totalHours - visibleRange, center - visibleRange / 2));
      xMax = Math.min(totalHours, xMin + visibleRange);
    }

    return {
      days,
      focused,
      xMin,
      xMax,
      data: {
        datasets: [
          {
            label: 'План',
            data: [
              { x: xMin, y: (totalPages * xMin) / Math.max(1, totalHours) },
              { x: xMax, y: (totalPages * xMax) / Math.max(1, totalHours) },
            ],
            borderColor: '#142b50',
            backgroundColor: '#142b50',
            pointRadius: 3,
            pointHoverRadius: 5,
            cubicInterpolationMode: 'monotone' as const,
            tension: 0.35,
          },
          {
            label: 'Факт',
            data: [{ x: xMin, y: 0 }, ...actualPoints, { x: xMax, y: accumulated }],
            borderColor: '#ff6900',
            backgroundColor: '#ff6900',
            pointRadius: 3,
            pointHoverRadius: 5,
            cubicInterpolationMode: 'monotone' as const,
            tension: 0.35,
          },
        ],
      },
    };
  }, [results, totalPages, training.endDate, training.startDate]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'nearest' as const },
    plugins: {
      legend: { display: true, position: 'bottom' as const },
      tooltip: {
        callbacks: {
          title: (items: { parsed: { x: number | null } }[]) => {
            const position = items[0]?.parsed.x ?? 0;
            const dayIndex = Math.min(chartData.days.length - 1, Math.floor(position / 24));
            const day = chartData.days[dayIndex];
            if (!day) return '';
            if (position >= chartData.days.length * 24) return `${formatDate(day)} · 23:59`;

            const minutes = Math.floor((position - dayIndex * 24) * 60);
            const time = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
            return `${formatDate(day)} · ${time}`;
          },
          label: (item: { dataset: { label?: string }; parsed: { y: number | null } }) =>
            `${item.dataset.label}: ${Math.round(item.parsed.y ?? 0)} стор.`,
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        min: chartData.xMin,
        max: chartData.xMax,
        title: { display: true, text: 'Дата й час' },
        grid: { color: '#e4e7ed' },
        ticks: {
          stepSize: chartData.focused ? 3 : 24,
          callback: (value: string | number) => {
            const position = Number(value);
            const dayIndex = Math.floor(position / 24);
            const day = chartData.days[Math.min(dayIndex, chartData.days.length - 1)];
            if (!day) return '';
            if (!chartData.focused) return formatDateLabel(day);

            const hour = Math.floor(position % 24);
            return `${formatDateLabel(day)} ${String(hour).padStart(2, '0')}:00`;
          },
        },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Накопичені прочитані сторінки' },
        ticks: { precision: 0 },
        grid: { color: '#e4e7ed' },
      },
    },
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const pageCount = Number(pages);
    const selectedDate = parseLocalDate(resultDate);
    if (!selectedDate || resultDate < training.startDate || resultDate > training.endDate) {
      setError('Дата має бути в межах періоду тренування.');
      return;
    }
    if (resultDate > today) {
      setError('Не можна додати результат за майбутню дату.');
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(resultTime)) {
      setError('Вкажіть коректний час прочитання.');
      return;
    }
    if (!Number.isInteger(pageCount) || pageCount <= 0) {
      setError('Вкажіть цілу кількість сторінок більше нуля.');
      return;
    }
    if (pageCount > remainingPages) {
      setError(`У тренуванні залишилося прочитати ${remainingPages} стор.`);
      return;
    }
    if (!validStart || !validEnd || now < validStart || now > validEnd) {
      setError('Результати можна додавати лише протягом періоду тренування.');
      return;
    }

    setSaving(true);
    try {
      const result = await addReadingResult(training.id, resultDate, resultTime, pageCount);
      const nextResults = [...results, result].sort(
        (left, right) =>
          left.date.localeCompare(right.date) ||
          (left.time ?? formatTime(left.createdAt)).localeCompare(
            right.time ?? formatTime(right.createdAt),
          ),
      );
      setResults(nextResults);
      setPages('');
      setSuccess('Результат успішно додано.');

      const previousTotal = pagesRead;
      const nextTotal = previousTotal + pageCount;
      let boundary = 0;
      const completedBooks: Book[] = [];
      for (const book of trainingBooks) {
        boundary += book.totalPages;
        if (previousTotal < boundary && nextTotal >= boundary && book.status !== 'read') {
          const updated = updateBook(book.id, { status: 'read', ratingPrompted: true });
          onBooksChange(updated);
          completedBooks.push(updated.find((item) => item.id === book.id) ?? book);
        }
      }
      if (completedBooks.length) setRatingQueue((queue) => [...queue, ...completedBooks]);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Не вдалося зберегти результат.',
      );
    } finally {
      setSaving(false);
    }
  }

  function closeRatingModal() {
    setRatingQueue((queue) => queue.slice(1));
    setRating(0);
  }

  function saveRating() {
    const book = ratingQueue[0];
    if (!book) return;
    try {
      onBooksChange(updateBook(book.id, rating > 0 ? { rating } : {}));
      closeRatingModal();
    } catch (ratingError) {
      setError(ratingError instanceof Error ? ratingError.message : 'Не вдалося зберегти оцінку.');
    }
  }

  return (
    <main className="page-content dashboard">
      <div className="dashboard-top">
        <div className="timer-grid">
          <TimerCard title="До кінця року" target={yearEnd} now={now} />
          <TimerCard title="До досягнення мети" target={validEnd} now={now} />
        </div>
        <section className="goal-card">
          <h2>Моя мета читання</h2>
          <div className="goal-numbers">
            <div>
              <strong>{trainingBooks.length}</strong>
              <span>книг у тренуванні</span>
            </div>
            <div>
              <strong>{pagesRead}</strong>
              <span>прочитано сторінок</span>
            </div>
            <div className="goal-remaining">
              <strong>{remainingPages}</strong>
              <span>залишилося сторінок</span>
            </div>
          </div>
          <div
            className="progress-track"
            aria-label={`Прочитано ${pagesRead} із ${totalPages} сторінок`}
          >
            <div
              style={{
                width: `${totalPages ? Math.min(100, (pagesRead / totalPages) * 100) : 0}%`,
              }}
            />
          </div>
        </section>
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-main">
          <section className="panel books-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">АКТИВНЕ ТРЕНУВАННЯ</p>
                <h1>Моє тренування</h1>
              </div>
              <p className="date-range">
                {formatDate(training.startDate)} — {formatDate(training.endDate)}
              </p>
            </div>
            <div className="table-scroll">
              <table className="book-table">
                <thead>
                  <tr>
                    <th>Назва книги</th>
                    <th>Автор</th>
                    <th>Рік</th>
                    <th>Стор.</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {trainingBooks.map((book) => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.year}</td>
                      <td>{book.totalPages}</td>
                      <td>
                        <span className={`status-pill status-${book.status}`}>
                          {book.status === 'read' ? 'Прочитано' : 'Читаю'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel chart-panel">
            <div className="chart-heading">
              <h2>Прогрес читання</h2>
              <span>
                {chartData.focused
                  ? 'Масштаб за часом результатів'
                  : totalPages
                    ? `${Math.round(totalPages / Math.max(1, getCalendarDays(training.startDate, training.endDate).length))} стор./день за планом`
                    : ''}
              </span>
            </div>
            {chartData.days.length ? (
              <div className="chart-canvas">
                <Line data={chartData.data} options={chartOptions} />
              </div>
            ) : (
              <p className="empty-state">
                Додайте коректний період тренування, щоб побачити графік.
              </p>
            )}
          </section>
        </div>

        <aside className="panel results-panel">
          <h2>Результати</h2>
          <form onSubmit={handleSubmit} className="result-form">
            <label>
              Дата
              <input
                type="date"
                value={resultDate}
                min={training.startDate}
                max={maxResultDate}
                onChange={(event) => setResultDate(event.target.value)}
                required
              />
            </label>
            <label>
              Час
              <input
                type="time"
                value={resultTime}
                onChange={(event) => setResultTime(event.target.value)}
                required
              />
            </label>
            <label>
              Кількість сторінок
              <input
                type="number"
                min="1"
                max={remainingPages}
                step="1"
                value={pages}
                onChange={(event) => setPages(event.target.value)}
                placeholder="32"
                required
              />
            </label>
            <button
              className="button button-primary result-submit"
              type="submit"
              disabled={saving || remainingPages === 0}
            >
              {saving ? 'Зберігаємо…' : 'Додати результат'}
            </button>
            {error && (
              <p className="form-message form-error" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="form-message form-success" role="status">
                {success}
              </p>
            )}
          </form>

          <div className="history">
            <h3>Історія</h3>
            {results.length ? (
              <div className="table-scroll">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Час</th>
                      <th>Сторінки</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...results].reverse().map((result) => (
                      <tr key={result.id}>
                        <td>{formatDate(result.date)}</td>
                        <td>{result.time ?? formatTime(result.createdAt)}</td>
                        <td>{result.pages}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-state">Результатів ще немає. Додайте перший прочитаний обсяг.</p>
            )}
          </div>
        </aside>
      </div>

      {ratingQueue[0] && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="rating-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rating-title"
          >
            <p className="eyebrow">КНИГУ ПРОЧИТАНО</p>
            <h2 id="rating-title">Оцініть книгу</h2>
            <p className="rating-book-title">{ratingQueue[0].title}</p>
            <div className="rating-stars" role="radiogroup" aria-label="Оцінка книги">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star} з 5`}
                  className={star <= rating ? 'star selected' : 'star'}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" className="button button-secondary" onClick={closeRatingModal}>
                Пізніше
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={saveRating}
                disabled={rating === 0}
              >
                Зберегти
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
