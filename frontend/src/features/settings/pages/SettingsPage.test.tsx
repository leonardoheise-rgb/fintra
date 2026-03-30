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
      await screen.findByRole('heading', { name: /^settings$/i, level: 1 }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/settings summary/i)).toBeInTheDocument();
    expect(screen.getByText(/^brl$/i)).toBeInTheDocument();
    expect(screen.getByText(/^en-us$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^1st$/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/support details/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save preferences/i })).toBeDisabled();

    await user.selectOptions(screen.getByLabelText(/default currency/i), 'USD');
    expect(screen.getByText(/unsaved preference changes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save preferences/i })).toBeEnabled();
    await user.selectOptions(screen.getByLabelText(/language and region/i), 'pt-BR');
    await user.selectOptions(screen.getByLabelText(/month starts on/i), '15');
    await user.click(screen.getByRole('button', { name: /save preferences/i }));

    expect(await screen.findByText(/preferências salvas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar preferências/i })).toBeDisabled();
    expect(screen.getByRole('heading', { name: /configurações/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/detalhes de suporte/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^15$/i).length).toBeGreaterThan(0);

    expect(
      JSON.parse(window.localStorage.getItem('fintra.display-preferences.user-1') ?? '{}'),
    ).toEqual({
      currency: 'USD',
      locale: 'pt-BR',
      monthStartDay: 15,
    });
  });

  it('shows support details without surfacing technical implementation labels', async () => {
    const user = userEvent.setup();
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

    await user.click(await screen.findByText(/support details/i));

    expect(await screen.findByText(/available whenever you sign in/i)).toBeInTheDocument();
    expect(screen.getAllByText(/owner@fintra.dev/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/supabase/i)).not.toBeInTheDocument();
  });

  it('applies runtime preferences to shared amount and month formatting', async () => {
    setRuntimeDisplayPreferences({
      currency: 'EUR',
      locale: 'pt-BR',
      monthStartDay: 1,
    });

    await waitFor(() => {
      expect(formatCurrency(12450.75)).toBe('€ 12.450,75');
      expect(formatMonthLabel('2026-03')).toBe('março de 2026');
    });
  });
});
