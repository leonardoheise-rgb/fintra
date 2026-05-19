import { describe, expect, it } from 'vitest';

import { resolvePasswordResetRedirectUrl } from './passwordResetRedirect';

describe('resolvePasswordResetRedirectUrl', () => {
  it('uses the configured public app URL when one is provided', () => {
    expect(
      resolvePasswordResetRedirectUrl(
        'https://fintra.example.com/',
        'http://localhost:5173',
      ),
    ).toBe('https://fintra.example.com/reset-password');
  });

  it('falls back to the current browser origin', () => {
    expect(resolvePasswordResetRedirectUrl('', 'http://localhost:5173')).toBe(
      'http://localhost:5173/reset-password',
    );
  });
});
