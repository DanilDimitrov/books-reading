import React, { useState } from 'react';
import { Modal } from '../Modal/Modal';
import { BooksRating } from '../BooksRating/BooksRating';
import { Button } from '../Button/Button';
import { updateBookRating } from '../../services/booksApi';
import styles from './RatingModal.module.css';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string; 
  onSuccess?: () => void; 
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  bookId,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);

      await updateBookRating({ bookId, rating, review });

      onSuccess?.();
      onClose();
    } catch (error) {
      alert('Сталася помилка при збереженні. Спробуйте ще раз.');
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.content}>
        <h3 className={styles.title}>Обрати рейтинг книги</h3>
        
        <BooksRating rating={rating} onRatingChange={setRating} inactiveBorderColor="#242A37" />

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Резюме</label>
          <textarea
            className={styles.textarea}
            placeholder="..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={5}
            disabled={isLoading}
          />
        </div>

        <div className={styles.buttonGroup}>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Назад
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Зберігається...' : 'Зберегти'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};