import { formatLocalIsoDate } from '../../../shared/lib/date/isoDates';
import { addMonthsToIsoDate } from '../../../shared/lib/date/months';

export function buildRecurringTransactionDates(
  startDate: string,
  throughDate = addMonthsToIsoDate(formatLocalIsoDate(), 12),
) {
  const dates: string[] = [];

  for (let offset = 0, date = startDate; date <= throughDate; offset += 1, date = addMonthsToIsoDate(startDate, offset)) {
    dates.push(date);
  }

  return dates;
}
