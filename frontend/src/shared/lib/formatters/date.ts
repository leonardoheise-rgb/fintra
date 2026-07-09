import {
  getDisplayPreferences,
  type DateFormatPreference,
} from '../../preferences/displayPreferences';

function padDatePart(value: number) {
  return String(value).padStart(2, '0');
}

function parseIsoDate(date: string) {
  const [yearText, monthText, dayText] = date.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { day, month, year };
}

export function formatMonthLabel(month: string, locale = getDisplayPreferences().locale) {
  const [yearText, monthText] = month.split('-');
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;

  if (
    Number.isNaN(year) ||
    Number.isNaN(monthIndex) ||
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    return month;
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthIndex, 1)));
}

export function formatIsoDateLabel(
  date: string,
  dateFormat: DateFormatPreference = getDisplayPreferences().dateFormat,
) {
  const parsedDate = parseIsoDate(date);

  if (!parsedDate) {
    return date;
  }

  const year = String(parsedDate.year);
  const month = padDatePart(parsedDate.month);
  const day = padDatePart(parsedDate.day);

  if (dateFormat === 'dd-MM-YYYY') {
    return `${day}-${month}-${year}`;
  }

  return `${year}-${month}-${day}`;
}
