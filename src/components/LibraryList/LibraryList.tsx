import React, { useState } from 'react';
import { type Book, updateBook } from '../../mockApi';
import { Modal } from '../Modal/Modal'; 
import { BooksRating } from '../BooksRating/BooksRating'; 
import { Button } from '../Button/Button'; 
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


  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');


  const handleOpenModal = (book: Book) => {
    setSelectedBook(book);
    setRating(book.rating || 0);

    const savedReview = localStorage.getItem(`review_${book.id}`) || book.review || '';
    setReview(savedReview);
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
    setRating(0);
    setReview('');
  };


  const handleSaveReview = () => {
    if (!selectedBook) return;


    localStorage.setItem(`review_${selectedBook.id}`, review);


    const updatedBooks = books.map((b) => {
      if (b.id === selectedBook.id) {
        return { ...b, rating: rating, review: review };
      }
      return b;
    });

    onBooksChange(updatedBooks);
    handleCloseModal();
  };

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
      review
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
                      {/* Робимо назву клікабельною для відкриття модалки */}
                      <td 
                        className="table-td" 
                        style={{ cursor: 'pointer', color: '#FF6B01' }}
                        onClick={() => handleOpenModal(book)}
                      >
                        📖 {book.title}
                      </td>
                      <td className="table-td">{book.author}</td>
                      <td className="table-td">{book.year}</td>
                      <td className="table-td">{book.totalPages}</td>
                      <td className="table-td book-rating">
                        {book.rating ? (
                          <>
                            {'★'.repeat(book.rating)}
                            {'☆'.repeat(5 - book.rating)}
                          </>
                        ) : (
                          <span style={{ color: '#a6abb9' }}>Рейтинг відсутній</span>
                        )}
                      </td>
                      <td className="table-td">
                        <button className="resume-btn" onClick={() => handleOpenModal(book)}>
                          Резюме
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

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


          {planningBooks.length > 0 && (
            <div className="next-button-container">
              <button className="next-btn" onClick={onNext}>
                Далі
              </button>
            </div>
          )}
        </>
      )}


      {selectedBook && (
        <Modal isOpen={!!selectedBook} onClose={handleCloseModal}>
          <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Обрати рейтинг книги</p>
            

            <BooksRating 
              rating={rating} 
              onRatingChange={(newRating) => setRating(newRating)} 
            />

            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Резюме</p>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #a6abb9',
                  resize: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
              <Button variant="secondary" onClick={handleCloseModal}>
                Назад
              </Button>
              <Button variant="primary" onClick={handleSaveReview}>
                Зберегти
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};