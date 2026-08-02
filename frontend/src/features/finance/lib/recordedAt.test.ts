import { createRecordedAtTimestamp } from './recordedAt';

describe('createRecordedAtTimestamp', () => {
  it('stores record time at whole-second precision', () => {
    expect(createRecordedAtTimestamp(new Date('2026-08-02T15:42:18.734Z'))).toBe(
      '2026-08-02T15:42:18.000Z',
    );
  });
});
