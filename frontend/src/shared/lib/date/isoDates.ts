const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDate(date: string) {
  if (!isoDatePattern.test(date)) {
    return null;
  }

  const [yearText, monthText, dayText] = date.split('-');
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const day = Number(dayText);

  if (
    Number.isNaN(year) ||
    Number.isNaN(monthIndex) ||
    Number.isNaN(day) ||
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    return null;
  }

  return {
    year,
    monthIndex,
    day,
  };
}

export function formatLocalIsoDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function addDaysToIsoDate(date: string, offset: number) {
  const parsedDate = parseIsoDate(date);

  if (!parsedDate) {
    return date;
  }

  const shiftedDate = new Date(
    Date.UTC(parsedDate.year, parsedDate.monthIndex, parsedDate.day + offset),
  );

  return `${shiftedDate.getUTCFullYear()}-${String(shiftedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(shiftedDate.getUTCDate()).padStart(2, '0')}`;
}
