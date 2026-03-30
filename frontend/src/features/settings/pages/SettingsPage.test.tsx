import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createAuthServiceStub } from '../../../test/createAuthServiceStub';
import { renderAppAtPath } from '../../../test/renderAppAtPath';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { setRuntimeDisplayPreferences } from '../../../shared/preferences/displayPreferences';

describe('SettingsPage', () => {
  it('persists display preferences for the signed-in user', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/settings', authService.service);

    expect(
      await screen.findByRole('heading', { name: /^settings$/i }, { timeout: 8000 }),
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/default currency/i), 'USD');
    await user.selectOptions(screen.getByLabelText(/default locale/i), 'pt-BR');
    await user.click(screen.getByRole('button', { name: /save display preferences/i }));

    await screen.findByText(/display preferences saved/i);

    expect(
      JSON.parse(window.localStorage.getItem('fintra.display-preferences.user-1') ?? '{}'),
    ).toEqual({
      currency: 'USD',
      locale: 'pt-BR',
    });
  });

  it('applies runtime preferences to shared amount and month formatting', async () => {
    setRuntimeDisplayPreferences({
      currency: 'EUR',
      locale: 'pt-BR',
    });

    await waitFor(() => {
      expect(formatCurrency(12450.75)).toBe('€ 12.450,75');
      expect(formatMonthLabel('2026-03')).toBe('março de 2026');
    });
  });
});
