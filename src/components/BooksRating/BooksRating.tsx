import React, { useState } from 'react';
import { Star } from 'lucide-react';
import styles from './BooksRating.module.css';

interface BooksRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
  inactiveBorderColor?: string;
}

export const BooksRating: React.FC<BooksRatingProps> = ({
  rating,
  onRatingChange,
  maxRating = 5,
  inactiveBorderColor = '#FF6B01', 
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  return (
    <div className={styles.starContainer}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (hoverRating || rating);

        return (
          <button
            type="button"
            key={starValue}
            className={`${styles.starButton} ${isFilled ? styles.filled : ''}`}
            style={{ stroke: isFilled ? '#FF6B01' : inactiveBorderColor }}
            onClick={() => onRatingChange(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <Star size={24} />
          </button>
        );
      })}
    </div>
  );
};