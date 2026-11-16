export function parseAppointmentDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Appointment date must use YYYY-MM-DD format; received "${value}".`);
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid appointment date: ${value}.`);
  }
  return date;
}

export function formatCalendarDateLabel(date: Date): string {
  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(date);
  const month = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
  const day = date.getUTCDate();
  const ordinal = day % 100 >= 11 && day % 100 <= 13
    ? 'th'
    : day % 10 === 1
      ? 'st'
      : day % 10 === 2
        ? 'nd'
        : day % 10 === 3
          ? 'rd'
          : 'th';
  return `${weekday}, ${month} ${day}${ordinal}, ${date.getUTCFullYear()}`;
}

export function formatAppointmentSummaryDate(date: Date): string {
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone: 'UTC',
  }).format(date);
  return `${day} ${month} ${date.getUTCFullYear()}`;
}

export function formatAppointmentCardDate(value: string): string {
  const date = parseAppointmentDate(value);
  const day = value.slice(8, 10);
  const month = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone: 'UTC',
  }).format(date);
  return `${day} ${month} ${date.getUTCFullYear()}`;
}
