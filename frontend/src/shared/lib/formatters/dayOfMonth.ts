function getOrdinalSuffix(day: number) {
  const lastTwoDigits = day % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'th';
  }

  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export function formatDayOfMonthLabel(day: number) {
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    return String(day);
  }

  return `${day}${getOrdinalSuffix(day)}`;
}
