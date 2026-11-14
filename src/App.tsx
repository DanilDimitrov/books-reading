import { useEffect, useState, type FormEvent } from 'react';
import ActiveTrainingDashboard from './ActiveTrainingDashboard';
import { getLocalDateString } from './dateUtils';
import { getBooks, getTraining, saveTraining, type Book, type Training } from './mockApi';
import './App.css';

function getDefaultEndDate(): string {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  return getLocalDateString(endDate);
}

function TrainingSetup({
  books,
  onStart,
}: {
  books: Book[];
  onStart: (training: Training) => void;
}) {
  const today = getLocalDateString(new Date());
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(getDefaultEndDate);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  function toggleBook(bookId: string) {
    setSelectedIds((ids) =>
      ids.includes(bookId) ? ids.filter((id) => id !== bookId) : [...ids, bookId],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!selectedIds.length) {
      setError('Оберіть щонайменше одну книгу для тренування.');
      return;
    }
    if (startDate < today || endDate < startDate) {
      setError(
        'Перевірте дати: початок не може бути в минулому, а завершення має бути після початку.',
      );
      return;
    }

    const training: Training = {
      id: crypto.randomUUID(),
      startDate,
      endDate,
      bookIds: selectedIds,
      active: true,
    };
    try {
      saveTraining(training);
      onStart(training);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не вдалося створити тренування.');
    }
  }

  const availableBooks = books.filter((book) => book.status !== 'read');

  return (
    <main className="page-content setup-page">
      <section className="panel setup-panel">
        <p className="eyebrow">НОВА ЦІЛЬ</p>
        <h1>Моє тренування</h1>
        <p className="setup-intro">Оберіть період і книги, які плануєте прочитати.</p>

        <form onSubmit={handleSubmit}>
          <div className="setup-dates">
            <label>
              Початок
              <input
                type="date"
                min={today}
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </label>
            <label>
              Завершення
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="setup-book-list">
            <h2>Книги для читання</h2>
            {availableBooks.length ? (
              availableBooks.map((book) => (
                <label className="selectable-book" key={book.id}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(book.id)}
                    onChange={() => toggleBook(book.id)}
                  />
                  <span className="book-option-copy">
                    <strong>{book.title}</strong>
                    <span>
                      {book.author} · {book.year}
                    </span>
                  </span>
                  <span className="book-pages">{book.totalPages} стор.</span>
                </label>
              ))
            ) : (
              <p className="empty-state">Усі книги прочитані. Додайте нові книги до бібліотеки.</p>
            )}
          </div>

          {error && (
            <p className="form-message form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button button-primary setup-submit"
            type="submit"
            disabled={!availableBooks.length}
          >
            Почати тренування
          </button>
        </form>
      </section>
    </main>
  );
}

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [training, setTraining] = useState<Training | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    try {
      setBooks(getBooks());
      setTraining(getTraining());
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Не вдалося завантажити дані тренування.',
      );
    }
  }, []);

  function handleStart(nextTraining: Training) {
    setTraining(nextTraining);
    setBooks(getBooks());
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="Books Reading — головна">
          BR
        </a>
        <div className="user-profile">
          <span className="avatar" aria-hidden="true">
            М
          </span>
          <span>Моє читання</span>
        </div>
        <span className="header-caption">
          {training?.active ? 'Активне тренування' : 'Планування читання'}
        </span>
      </header>

      {loadError ? (
        <main className="page-content">
          <p className="form-message form-error" role="alert">
            {loadError}
          </p>
        </main>
      ) : training?.active ? (
        <ActiveTrainingDashboard
          key={training.id}
          training={training}
          books={books}
          onBooksChange={setBooks}
        />
      ) : (
        <TrainingSetup books={books} onStart={handleStart} />
      )}
    </div>
  );
}

export default App;
