export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  expired: boolean;
};

export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }

  return date;
}

export function getEndOfDay(value: string): Date | null {
  const date = parseLocalDate(value);
  if (!date) return null;
  date.setHours(23, 59, 59, 999);
  return date;
}

export function getCountdown(target: Date, now: Date): Countdown {
  const difference = target.getTime() - now.getTime();
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };

  const totalMinutes = Math.floor(difference / 60_000);
  return {
    days: Math.floor(totalMinutes / (60 * 24)),
    hours: Math.floor((totalMinutes % (60 * 24)) / 60),
    minutes: totalMinutes % 60,
    expired: false,
  };
}

export function getCalendarDays(start: string, end: string): string[] {
  const firstDay = parseLocalDate(start);
  const lastDay = parseLocalDate(end);
  if (!firstDay || !lastDay || firstDay > lastDay) return [];

  const days: string[] = [];
  const cursor = new Date(firstDay);
  while (cursor <= lastDay) {
    days.push(getLocalDateString(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function formatDate(value: string): string {
  const date = parseLocalDate(value);
  return date
    ? new Intl.DateTimeFormat('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
    : '—';
}

export function formatDateLabel(value: string): string {
  const date = parseLocalDate(value);
  return date
    ? new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: '2-digit' }).format(date)
    : '—';
}

export function formatTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit' }).format(date);
}
