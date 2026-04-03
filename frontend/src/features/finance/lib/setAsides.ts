import { addDaysToIsoDate } from '../../../shared/lib/date/isoDates';
import { getMonthKey } from '../../../shared/lib/date/months';
import type { SetAsideRecord } from '../finance.types';

export function filterSetAsidesByMonth(
  setAsides: SetAsideRecord[],
  month: string,
  monthStartDay = 1,
) {
  return setAsides.filter((item) => getMonthKey(item.date, monthStartDay) === month);
}

export function sortSetAsidesByDateAsc(setAsides: SetAsideRecord[]) {
  return [...setAsides].sort(
    (left, right) => left.date.localeCompare(right.date) || left.description.localeCompare(right.description),
  );
}

export function getDueSetAsides(setAsides: SetAsideRecord[], todayIsoDate: string) {
  return sortSetAsidesByDateAsc(
    setAsides.filter((item) => addDaysToIsoDate(item.date, 1) <= todayIsoDate),
  );
}
