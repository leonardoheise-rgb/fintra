export function createRecordedAtTimestamp(now = new Date()) {
  const timestamp = new Date(now);
  timestamp.setUTCMilliseconds(0);

  return timestamp.toISOString();
}
