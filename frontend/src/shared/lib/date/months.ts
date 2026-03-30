const monthKeyPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

function parseMonthKey(month: string) {
  const [yearText, monthText] = month.split('-');
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;

  if (
    Number.isNaN(year) ||
    Number.isNaN(monthIndex) ||
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    return null;
  }

  return { year, monthIndex };
}

export function isValidMonthKey(month: string) {
  return monthKeyPattern.test(month);
}

export function getMonthKey(date: string) {
  return date.slice(0, 7);
}

export function getCurrentMonthKey(now = new Date()) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonthKey(month: string, offset: number) {
  const parsedMonth = parseMonthKey(month);

  if (!parsedMonth) {
    return month;
  }

  const shiftedDate = new Date(Date.UTC(parsedMonth.year, parsedMonth.monthIndex + offset, 1));

  return getCurrentMonthKey(shiftedDate);
}

export function buildMonthRange(startMonth: string, endMonth: string) {
  if (!isValidMonthKey(startMonth) || !isValidMonthKey(endMonth)) {
    return [];
  }

  const months: string[] = [];
  let currentMonth = startMonth;

  while (currentMonth <= endMonth) {
    months.push(currentMonth);
    currentMonth = shiftMonthKey(currentMonth, 1);
  }

  return months;
}
