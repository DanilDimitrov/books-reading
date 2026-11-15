import { useEffect, useState, type FormEvent } from 'react';
import ActiveTrainingDashboard from './ActiveTrainingDashboard';
import { LibraryList } from './components/LibraryList/LibraryList';
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
  
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  
  const [error, setError] = useState('');

  const availableBooks = books.filter(
    (book) => book.status !== 'read' && !selectedBooks.some((selected) => selected.id === book.id)
  );

  function handleAddBook() {
    if (!selectedBookId) return;
    const bookToAdd = books.find((book) => book.id === selectedBookId);
    if (!bookToAdd) return;

    if (selectedBooks.some((book) => book.id === bookToAdd.id)) {
      return;
    }

    setSelectedBooks((prev) => [...prev, bookToAdd]);
    setSelectedBookId('');
  }

  function handleRemoveBook(bookId: string) {
    setSelectedBooks((prev) => prev.filter((book) => book.id !== bookId));
  }

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    const diffTime = endMs - startMs;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const totalBooksCount = selectedBooks.length;
  const totalDays = calculateDays(startDate, endDate);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!selectedBooks.length) {
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
      bookIds: selectedBooks.map((book) => book.id),
      active: true,
    };
    try {
      saveTraining(training);
      onStart(training);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не вдалося створити тренування.');
    }
  }

  const unreadBooks = books.filter((book) => book.status !== 'read');

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

          <div className="setup-book-selection" style={{ marginTop: '20px' }}>
            <label>
              Оберіть книгу
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <select
                  value={selectedBookId}
                  onChange={(event) => setSelectedBookId(event.target.value)}
                  style={{ flex: 1, padding: '8px' }}
                >
                  <option value="">-- Оберіть книгу з бібліотеки --</option>
                  {availableBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} ({book.author}, {book.totalPages} стор.)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={handleAddBook}
                  disabled={!selectedBookId}
                >
                  Додати
                </button>
              </div>
            </label>
          </div>

          <div className="selected-books-section" style={{ marginTop: '20px' }}>
            <h2>Обрані книги для тренування</h2>
            {selectedBooks.length === 0 ? (
              <p className="empty-state">Список обраних книг порожній.</p>
            ) : (
              <ul className="books-list" style={{ listStyle: 'none', padding: 0 }}>
                {selectedBooks.map((book) => (
                  <li
                    key={book.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <span>
                      <strong>{book.title}</strong> — {book.author} ({book.totalPages} стор.)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBook(book.id)}
                      className="delete-btn"
                      aria-label="Видалити книгу"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                      🗑️
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="goal-widget" style={{ margin: '20px 0', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
            <h3>Моя мета прочитати</h3>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <div>
                <strong>{totalBooksCount}</strong> <span>книжжок</span>
              </div>
              <div>
                <strong>{totalDays}</strong> <span>днів</span>
              </div>
            </div>
          </div>

          {error && (
            <p className="form-message form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button button-primary setup-submit"
            type="submit"
            disabled={!unreadBooks.length || selectedBooks.length === 0}
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
  const [currentView, setCurrentView] = useState<'library' | 'setup'>('library');

  useEffect(() => {
    try {
      const loadedBooks = getBooks();
      const loadedTraining = getTraining();
      setBooks(loadedBooks);
      setTraining(loadedTraining);
      if (loadedTraining?.active) {
        setCurrentView('library');
      }
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

  const planningBooks = books.filter((book) => book.status === 'planned');

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
          <span>Макс Меленчук</span>
        </div>
        <span className="header-caption">
          {training?.active
            ? 'Активне тренування'
            : currentView === 'setup'
              ? 'Планування читання'
              : 'Бібліотека'}
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
      ) : currentView === 'setup' ? (
        <TrainingSetup books={books} onStart={handleStart} />
      ) : (
        <LibraryList
          books={books}
          onBooksChange={setBooks}
          onNext={() => setCurrentView('setup')}
        />
      )}
    </div>
  );
}

export default App;