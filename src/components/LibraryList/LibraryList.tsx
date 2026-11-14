import React, { useState } from 'react';
import { type Book, updateBook } from '../../mockApi';
import './LibraryList.css';

interface LibraryListProps {
  books: Book[];
  onBooksChange: (books: Book[]) => void;
  onNext: () => void;
}

export const LibraryList: React.FC<LibraryListProps> = ({ books, onBooksChange, onNext }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [pages, setPages] = useState('');

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !year || !pages) return;

    const newBook: Book = {
      id: crypto.randomUUID(),
      title,
      author,
      year: Number(year),
      totalPages: Number(pages),
      status: 'planned',
    };

    const updated = [...books, newBook];
    onBooksChange(updated);
    setTitle('');
    setAuthor('');
    setYear('');
    setPages('');
  };

  const finishedBooks = books.filter((book) => book.status === 'read');
  const readingBooks = books.filter((book) => book.status === 'reading');
  const planningBooks = books.filter((book) => book.status === 'planned');

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
                      <td className="table-td">{book.totalPages}</td>
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
                      <td className="table-td">{book.totalPages}</td>
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
                      <td className="table-td">{book.totalPages}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Кнопка "Далі" */}
          {planningBooks.length > 0 && (
            <div className="next-button-container">
              <button className="next-btn" onClick={onNext}>
                Далі
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
