import React, { useEffect, useState } from 'react';
import './LibraryList.css';

interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  pages: number;
  status: 'finished' | 'reading' | 'planning';
  rating?: number;
  resume?: string;
}

export const LibraryList: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [books, setBooks] = useState<Book[]>([]);

  // Поля форми для додавання книги
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [pages, setPages] = useState('');

  useEffect(() => {
    const fetchBooks = () => {
      try {
        const savedBooks: Book[] = [
          {
            id: '1',
            title: 'Психобольница в руках пациентов...',
            author: 'Купер Алан',
            year: 2009,
            pages: 183,
            status: 'finished',
            rating: 4,
          },
          {
            id: '2',
            title: 'Разработка ценностных предложений.',
            author: 'Алекс Остервальдер, Ив Пинье',
            year: 2013,
            pages: 368,
            status: 'reading',
          },
          {
            id: '3',
            title: 'Scrum. Революционный метод...',
            author: 'Джефф Сазерленд',
            year: 2014,
            pages: 25,
            status: 'planning',
          },
        ];
        setBooks(savedBooks);
      } catch (error) {
        console.error('Помилка завантаження книг:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !year || !pages) return;

    const newBook: Book = {
      id: Date.now().toString(),
      title,
      author,
      year: Number(year),
      pages: Number(pages),
      status: 'planning',
    };

    setBooks([...books, newBook]);
    setTitle('');
    setAuthor('');
    setYear('');
    setPages('');
  };

  const finishedBooks = books.filter((book) => book.status === 'finished');
  const readingBooks = books.filter((book) => book.status === 'reading');
  const planningBooks = books.filter((book) => book.status === 'planning');

  if (isLoading) {
    return <div className="loading-container">Завантаження бібліотеки...</div>;
  }

  return (
    <div className="library-container">
      {/* Форма додавання книги */}
      <form onSubmit={handleAddBook} className="library-form">
        <div className="form-group">
          <label className="form-label">Назва книги</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="..."
            className="form-input form-input-title"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Автор книги</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="..."
            className="form-input form-input-author"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Рік випуску</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="..."
            className="form-input form-input-number"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Кількість сторінок</label>
          <input
            type="number"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            placeholder="..."
            className="form-input form-input-number"
          />
        </div>
        <button type="submit" className="form-button">
          Додати
        </button>
      </form>

      {/* Якщо бібліотека порожня */}
      {books.length === 0 ? (
        <div className="empty-library">
          <h3 className="empty-title">Крок 1.</h3>
          <p className="empty-step-title">📖 Створіть особисту бібліотеку</p>
          <p className="empty-step-desc">Додайте до неї книжки, які маєте намір прочитати.</p>

          <h3 className="empty-title">Крок 2.</h3>
          <p className="empty-step-title">🚩 Сформуйте своє перше тренування</p>
          <p className="empty-step-desc">Визначте ціль, оберіть період, розпочинайте тренування.</p>
        </div>
      ) : (
        <>
          {/* Секція: Прочитано */}
          {finishedBooks.length > 0 && (
            <section className="library-section">
              <h2 className="section-title">Прочитано</h2>
              <table className="library-table">
                <thead>
                  <tr className="table-header">
                    <th className="table-th">Назва книги</th>
                    <th className="table-th">Автор</th>
                    <th className="table-th">Рік</th>
                    <th className="table-th">Стор.</th>
                    <th className="table-th">Рейтинг книги</th>
                    <th className="table-th"></th>
                  </tr>
                </thead>
                <tbody>
                  {finishedBooks.map((book) => (
                    <tr key={book.id} className="table-row">
                      <td className="table-td">📖 {book.title}</td>
                      <td className="table-td">{book.author}</td>
                      <td className="table-td">{book.year}</td>
                      <td className="table-td">{book.pages}</td>
                      <td className="table-td book-rating">
                        {'★'.repeat(book.rating || 0)}
                        {'☆'.repeat(5 - (book.rating || 0))}
                      </td>
                      <td className="table-td">
                        <button className="resume-btn">Резюме</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Секція: Читаю */}
          {readingBooks.length > 0 && (
            <section className="library-section">
              <h2 className="section-title">Читаю</h2>
              <table className="library-table">
                <thead>
                  <tr className="table-header">
                    <th className="table-th">Назва книги</th>
                    <th className="table-th">Автор</th>
                    <th className="table-th">Рік</th>
                    <th className="table-th">Стор.</th>
                  </tr>
                </thead>
                <tbody>
                  {readingBooks.map((book) => (
                    <tr key={book.id} className="table-row">
                      <td className="table-td book-title-reading">📙 {book.title}</td>
                      <td className="table-td">{book.author}</td>
                      <td className="table-td">{book.year}</td>
                      <td className="table-td">{book.pages}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Секція: Маю намір прочитати */}
          {planningBooks.length > 0 && (
            <section className="library-section">
              <h2 className="section-title">Маю намір прочитати</h2>
              <table className="library-table">
                <thead>
                  <tr className="table-header">
                    <th className="table-th">Назва книги</th>
                    <th className="table-th">Автор</th>
                    <th className="table-th">Рік</th>
                    <th className="table-th">Стор.</th>
                  </tr>
                </thead>
                <tbody>
                  {planningBooks.map((book) => (
                    <tr key={book.id} className="table-row">
                      <td className="table-td">📖 {book.title}</td>
                      <td className="table-td">{book.author}</td>
                      <td className="table-td">{book.year}</td>
                      <td className="table-td">{book.pages}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Кнопка "Далі" */}
          {planningBooks.length > 0 && (
            <div className="next-button-container">
              <button className="next-btn">Далі</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
