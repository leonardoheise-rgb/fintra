import { buildMonthRange, isValidMonthKey, shiftMonthKey } from '../../../shared/lib/date/months';
import type { AnalyticsRange, AnalyticsRangePreset } from '../analytics.types';

type ResolveAnalyticsRangeOptions = {
  customEndMonth?: string;
  customStartMonth?: string;
  endMonth: string;
  preset: AnalyticsRangePreset;
};

const presetMonthCount: Record<Exclude<AnalyticsRangePreset, 'custom'>, number> = {
  '3m': 3,
  '6m': 6,
  '12m': 12,
};

export function getPresetLabel(preset: AnalyticsRangePreset) {
  switch (preset) {
    case '3m':
      return 'Last 3 months';
    case '6m':
      return 'Last 6 months';
    case '12m':
      return 'Last 12 months';
    case 'custom':
      return 'Custom range';
    default:
      return preset;
  }
}

export function resolveAnalyticsRange({
  customEndMonth,
  customStartMonth,
  endMonth,
  preset,
}: ResolveAnalyticsRangeOptions): AnalyticsRange {
  const safeEndMonth = isValidMonthKey(endMonth) ? endMonth : shiftMonthKey(endMonth, 0);

  if (preset === 'custom') {
    const normalizedStartMonth =
      customStartMonth && isValidMonthKey(customStartMonth) ? customStartMonth : safeEndMonth;
    const normalizedEndMonth =
      customEndMonth && isValidMonthKey(customEndMonth) ? customEndMonth : safeEndMonth;
    const startMonth =
      normalizedStartMonth <= normalizedEndMonth ? normalizedStartMonth : normalizedEndMonth;
    const finalEndMonth =
      normalizedEndMonth >= normalizedStartMonth ? normalizedEndMonth : normalizedStartMonth;

    return {
      preset,
      startMonth,
      endMonth: finalEndMonth,
      months: buildMonthRange(startMonth, finalEndMonth),
    };
  }

  const monthCount = presetMonthCount[preset];
  const startMonth = shiftMonthKey(safeEndMonth, -(monthCount - 1));

  return {
    preset,
    startMonth,
    endMonth: safeEndMonth,
    months: buildMonthRange(startMonth, safeEndMonth),
  };
}
