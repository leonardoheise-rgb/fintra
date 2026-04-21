import { isValidMonthKey, shiftMonthKey } from '../../../shared/lib/date/months';

export type BudgetPacingStatus = 'above' | 'below' | 'aligned';

export type BudgetPacing = {
  elapsedDays: number;
  totalDays: number;
  elapsedPercentage: number;
  expectedPercentage: number;
  status: BudgetPacingStatus;
};

function getMonthBounds(month: string, monthStartDay: number) {
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

  const startDay = Math.min(monthStartDay, new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate());
  const nextMonth = shiftMonthKey(month, 1);
  const [nextYearText, nextMonthText] = nextMonth.split('-');
  const nextYear = Number(nextYearText);
  const nextMonthIndex = Number(nextMonthText) - 1;
  const nextStartDay = Math.min(
    monthStartDay,
    new Date(Date.UTC(nextYear, nextMonthIndex + 1, 0)).getUTCDate(),
  );

  return {
    start: Date.UTC(year, monthIndex, startDay),
    end: Date.UTC(nextYear, nextMonthIndex, nextStartDay),
  };
}

function clampPercentage(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function getElapsedDays(nowAtUtcMidnight: number, start: number, end: number) {
  const dayDuration = 24 * 60 * 60 * 1000;
  const totalDays = Math.max(Math.round((end - start) / dayDuration), 1);

  if (nowAtUtcMidnight < start) {
    return {
      elapsedDays: 0,
      totalDays,
    };
  }

  if (nowAtUtcMidnight >= end) {
    return {
      elapsedDays: totalDays,
      totalDays,
    };
  }

  return {
    elapsedDays: Math.min(Math.floor((nowAtUtcMidnight - start) / dayDuration) + 1, totalDays),
    totalDays,
  };
}

export function resolveBudgetPacing(
  spentPercentage: number,
  month: string,
  monthStartDay: number,
  now = new Date(),
): BudgetPacing {
  if (!isValidMonthKey(month)) {
    return {
      elapsedDays: 0,
      totalDays: 1,
      elapsedPercentage: 100,
      expectedPercentage: 100,
      status: 'aligned',
    };
  }

  const monthBounds = getMonthBounds(month, monthStartDay);

  if (!monthBounds || monthBounds.end <= monthBounds.start) {
    return {
      elapsedDays: 0,
      totalDays: 1,
      elapsedPercentage: 100,
      expectedPercentage: 100,
      status: 'aligned',
    };
  }

  const nowAtUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const { elapsedDays, totalDays } = getElapsedDays(
    nowAtUtcMidnight,
    monthBounds.start,
    monthBounds.end,
  );
  const expectedPercentage = clampPercentage((elapsedDays / totalDays) * 100);
  const elapsedPercentage = expectedPercentage;
  const spentGap = spentPercentage - expectedPercentage;

  /**
   * A small tolerance prevents copy from flipping because of 1-2 percentage point
   * rounding noise when a budget is roughly matching the ideal daily pace.
   */
  if (spentGap > 5) {
    return {
      elapsedDays,
      totalDays,
      elapsedPercentage,
      expectedPercentage,
      status: 'above',
    };
  }

  if (spentGap < -5) {
    return {
      elapsedDays,
      totalDays,
      elapsedPercentage,
      expectedPercentage,
      status: 'below',
    };
  }

  return {
    elapsedDays,
    totalDays,
    elapsedPercentage,
    expectedPercentage,
    status: 'aligned',
  };
}
