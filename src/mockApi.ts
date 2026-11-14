export type BookStatus = 'planned' | 'reading' | 'read';

export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  totalPages: number;
  status: BookStatus;
  rating?: number;
  ratingPrompted?: boolean;
};

export type Training = {
  id: string;
  startDate: string;
  endDate: string;
  bookIds: string[];
  active: boolean;
};

export type ReadingResult = {
  id: string;
  trainingId: string;
  date: string;
  time?: string;
  createdAt: string;
  pages: number;
};

function getResultTime(result: ReadingResult): string {
  return result.time ?? new Date(result.createdAt).toTimeString().slice(0, 5);
}

const BOOKS_KEY = 'reading-trainer.books';
const TRAINING_KEY = 'reading-trainer.training';
const RESULTS_KEY = 'reading-trainer.results';

const sampleBooks: Book[] = [
  {
    id: 'book-scrum',
    title: 'Scrum. Революційний метод управління проєктами',
    author: 'Джефф Сазерленд',
    year: 2014,
    totalPages: 256,
    status: 'planned',
  },
  {
    id: 'book-deadline',
    title: 'Deadline. Роман про управління проєктами',
    author: 'Том ДеМарко',
    year: 2006,
    totalPages: 288,
    status: 'planned',
  },
  {
    id: 'book-team',
    title: '5 пороків команди. Притчи о лидерстве',
    author: 'Патрік Ленсіоні',
    year: 2011,
    totalPages: 240,
    status: 'planned',
  },
];

function readStorage<T>(key: string, fallback: T): T {
  const stored = sessionStorage.getItem(key);
  return stored === null ? fallback : (JSON.parse(stored) as T);
}

function writeStorage<T>(key: string, value: T): void {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function initialize(): void {
  if (sessionStorage.getItem(BOOKS_KEY) === null) writeStorage(BOOKS_KEY, sampleBooks);
  if (sessionStorage.getItem(RESULTS_KEY) === null) writeStorage(RESULTS_KEY, []);
}

export function getBooks(): Book[] {
  initialize();
  return readStorage<Book[]>(BOOKS_KEY, []);
}

export function getTraining(): Training | null {
  initialize();
  return readStorage<Training | null>(TRAINING_KEY, null);
}

export function getReadingResults(trainingId: string): ReadingResult[] {
  initialize();
  return readStorage<ReadingResult[]>(RESULTS_KEY, [])
    .filter((result) => result.trainingId === trainingId)
    .sort(
      (left, right) =>
        left.date.localeCompare(right.date) ||
        getResultTime(left).localeCompare(getResultTime(right)),
    );
}

export function saveTraining(training: Training): void {
  initialize();
  writeStorage(TRAINING_KEY, training);
  const selectedIds = new Set(training.bookIds);
  writeStorage(
    BOOKS_KEY,
    getBooks().map((book) =>
      selectedIds.has(book.id) && book.status !== 'read' ? { ...book, status: 'reading' } : book,
    ),
  );
}

export async function addReadingResult(
  trainingId: string,
  date: string,
  time: string,
  pages: number,
): Promise<ReadingResult> {
  initialize();
  const training = getTraining();
  if (!training || training.id !== trainingId || !training.active) {
    throw new Error('Активне тренування не знайдено.');
  }
  if (!Number.isInteger(pages) || pages <= 0) {
    throw new Error('Вкажіть цілу кількість сторінок більше нуля.');
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new Error('Вкажіть коректний час прочитання.');
  }

  const books = getBooks().filter((book) => training.bookIds.includes(book.id));
  const totalPages = books.reduce((total, book) => total + book.totalPages, 0);
  const results = readStorage<ReadingResult[]>(RESULTS_KEY, []);
  const completedPages = results
    .filter((result) => result.trainingId === trainingId)
    .reduce((total, result) => total + result.pages, 0);
  if (pages > totalPages - completedPages) {
    throw new Error(
      `Можна зарахувати не більше ${Math.max(0, totalPages - completedPages)} сторінок.`,
    );
  }

  const result: ReadingResult = {
    id: crypto.randomUUID(),
    trainingId,
    date,
    time,
    createdAt: new Date().toISOString(),
    pages,
  };
  writeStorage(RESULTS_KEY, [...results, result]);
  return result;
}

export function updateBook(bookId: string, updates: Partial<Book>): Book[] {
  const books = getBooks();
  const index = books.findIndex((book) => book.id === bookId);
  if (index === -1) throw new Error('Книгу не знайдено.');

  const updatedBooks = books.map((book) => (book.id === bookId ? { ...book, ...updates } : book));
  writeStorage(BOOKS_KEY, updatedBooks);
  return updatedBooks;
}
