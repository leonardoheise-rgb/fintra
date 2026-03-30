import { isValidMonthKey, shiftMonthKey } from '../../../shared/lib/date/months';

export type BudgetPacingStatus = 'above' | 'below' | 'aligned';

export type BudgetPacing = {
  elapsedPercentage: number;
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

export function resolveBudgetPacing(
  spentPercentage: number,
  month: string,
  monthStartDay: number,
  now = new Date(),
): BudgetPacing {
  if (!isValidMonthKey(month)) {
    return {
      elapsedPercentage: 100,
      status: 'aligned',
    };
  }

  const monthBounds = getMonthBounds(month, monthStartDay);

  if (!monthBounds || monthBounds.end <= monthBounds.start) {
    return {
      elapsedPercentage: 100,
      status: 'aligned',
    };
  }

  const nowAtUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const elapsedPercentage = clampPercentage(
    ((nowAtUtcMidnight - monthBounds.start) / (monthBounds.end - monthBounds.start)) * 100,
  );
  const spentGap = spentPercentage - elapsedPercentage;

  /**
   * A small tolerance prevents copy from flipping because of 1-2 percentage point
   * rounding noise when a budget is roughly matching the ideal daily pace.
   */
  if (spentGap > 5) {
    return {
      elapsedPercentage,
      status: 'above',
    };
  }

  if (spentGap < -5) {
    return {
      elapsedPercentage,
      status: 'below',
    };
  }

  return {
    elapsedPercentage,
    status: 'aligned',
  };
}
