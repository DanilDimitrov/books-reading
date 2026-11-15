interface AddReviewPayload {
  bookId: string;
  rating: number;
  review: string;
}

export const updateBookRating = async ({ bookId, rating, review }: AddReviewPayload) => {
  try {
    const response = await fetch(`https://6af8178d9bdd097c326e92b2.mockapi.io/api/booksApi/books/${bookId}`, {
      method: 'PATCH', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rating, review }),
    });

    if (!response.ok) {
      throw new Error('Не вдалося зберегти рейтинг та відгук');
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error('Помилка запиту:', error);
    throw error;
  }
};