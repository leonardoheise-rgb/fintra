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
    expect(screen.getByLabelText(/settings summary/i)).toBeInTheDocument();
    expect(screen.getByText(/^brl$/i)).toBeInTheDocument();
    expect(screen.getByText(/^en-us$/i)).toBeInTheDocument();
    expect(screen.getByText(/^preview$/i)).toBeInTheDocument();
    expect(screen.getByText(/this build is still running in preview mode/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save display preferences/i })).toBeDisabled();

    await user.selectOptions(screen.getByLabelText(/default currency/i), 'USD');
    expect(screen.getByText(/unsaved display preference changes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save display preferences/i })).toBeEnabled();
    await user.selectOptions(screen.getByLabelText(/default locale/i), 'pt-BR');
    await user.click(screen.getByRole('button', { name: /save display preferences/i }));

    expect(await screen.findByText(/display preferences saved/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save display preferences/i })).toBeDisabled();

    expect(
      JSON.parse(window.localStorage.getItem('fintra.display-preferences.user-1') ?? '{}'),
    ).toEqual({
      currency: 'USD',
      locale: 'pt-BR',
    });
  });

  it('shows the Supabase deployment status when the workspace uses the real backend', async () => {
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
      mode: 'supabase',
    });

    await renderAppAtPath('/settings', authService.service);

    expect(
      await screen.findByText(/connected to supabase auth and persisted finance data/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/synced workspace/i).length).toBeGreaterThan(0);
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
