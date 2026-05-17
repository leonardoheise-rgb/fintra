import { formatLocalIsoDate } from './isoDates';

const monthKeyPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

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

function formatMonthKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

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

function clampMonthStartDay(year: number, monthIndex: number, monthStartDay: number) {
  return Math.min(
    Math.max(monthStartDay, 1),
    new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate(),
  );
}

function getFinancialMonthStart(parsedDate: {
  year: number;
  monthIndex: number;
  day: number;
}, monthStartDay: number) {
  const currentMonthStartDay = clampMonthStartDay(
    parsedDate.year,
    parsedDate.monthIndex,
    monthStartDay,
  );

  if (parsedDate.day >= currentMonthStartDay) {
    return {
      year: parsedDate.year,
      monthIndex: parsedDate.monthIndex,
      day: currentMonthStartDay,
    };
  }

  const previousMonth = new Date(Date.UTC(parsedDate.year, parsedDate.monthIndex - 1, 1));
  const previousYear = previousMonth.getUTCFullYear();
  const previousMonthIndex = previousMonth.getUTCMonth();

  return {
    year: previousYear,
    monthIndex: previousMonthIndex,
    day: clampMonthStartDay(previousYear, previousMonthIndex, monthStartDay),
  };
}

function getClosestCalendarMonthToStartDate(periodStart: {
  year: number;
  monthIndex: number;
  day: number;
}) {
  const startDate = new Date(
    Date.UTC(periodStart.year, periodStart.monthIndex, periodStart.day),
  );
  const startMonthFirstDay = new Date(Date.UTC(periodStart.year, periodStart.monthIndex, 1));
  const nextMonthFirstDay = new Date(Date.UTC(periodStart.year, periodStart.monthIndex + 1, 1));
  const distanceToStartMonth = Math.abs(startDate.getTime() - startMonthFirstDay.getTime());
  const distanceToNextMonth = Math.abs(nextMonthFirstDay.getTime() - startDate.getTime());

  if (distanceToStartMonth <= distanceToNextMonth) {
    return formatMonthKey(periodStart.year, periodStart.monthIndex);
  }

  return formatMonthKey(nextMonthFirstDay.getUTCFullYear(), nextMonthFirstDay.getUTCMonth());
}

export function isValidMonthKey(month: string) {
  return monthKeyPattern.test(month);
}

export function getMonthKey(date: string, monthStartDay = 1) {
  const parsedDate = parseIsoDate(date);

  if (!parsedDate) {
    return date.slice(0, 7);
  }

  return getClosestCalendarMonthToStartDate(
    getFinancialMonthStart(parsedDate, monthStartDay),
  );
}

export function getCurrentMonthKey(now = new Date(), monthStartDay = 1) {
  const isoDate = formatLocalIsoDate(now);

  return getMonthKey(isoDate, monthStartDay);
}

export function shiftMonthKey(month: string, offset: number) {
  const parsedMonth = parseMonthKey(month);

  if (!parsedMonth) {
    return month;
  }

  const shiftedDate = new Date(Date.UTC(parsedMonth.year, parsedMonth.monthIndex + offset, 1));

  return formatMonthKey(shiftedDate.getUTCFullYear(), shiftedDate.getUTCMonth());
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

export function addMonthsToIsoDate(date: string, offset: number) {
  const parsedDate = parseIsoDate(date);

  if (!parsedDate) {
    return date;
  }

  const shiftedMonthStart = new Date(Date.UTC(parsedDate.year, parsedDate.monthIndex + offset, 1));
  const shiftedYear = shiftedMonthStart.getUTCFullYear();
  const shiftedMonthIndex = shiftedMonthStart.getUTCMonth();
  const shiftedDay = Math.min(
    parsedDate.day,
    new Date(Date.UTC(shiftedYear, shiftedMonthIndex + 1, 0)).getUTCDate(),
  );

  return `${shiftedYear}-${String(shiftedMonthIndex + 1).padStart(2, '0')}-${String(shiftedDay).padStart(2, '0')}`;
}
