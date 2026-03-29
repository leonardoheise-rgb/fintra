import { getErrorMessage } from './getErrorMessage';

describe('getErrorMessage', () => {
  it('returns the message from native errors', () => {
    expect(getErrorMessage(new Error('Native error'), 'Fallback')).toBe('Native error');
  });

  it('returns the message from Supabase-style error objects', () => {
    expect(
      getErrorMessage(
        {
          code: '23502',
          message: 'null value in column "description" violates not-null constraint',
        },
        'Fallback',
      ),
    ).toBe('null value in column "description" violates not-null constraint');
  });

  it('falls back when the input has no readable message', () => {
    expect(getErrorMessage({ code: 'unknown' }, 'Fallback')).toBe('Fallback');
  });
});
