import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

import { createAuthServiceStub } from '../../../test/createAuthServiceStub';
import { renderAppAtPath } from '../../../test/renderAppAtPath';

describe('ForgotPasswordPage', () => {
  it('validates an empty email', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub();

    await renderAppAtPath('/forgot-password', authService.service);

    await user.click(await screen.findByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(authService.service.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('requests a password reset link for a valid email', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub();

    await renderAppAtPath('/forgot-password', authService.service);

    await user.type(await screen.findByLabelText(/email/i), 'user@fintra.dev');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(authService.service.requestPasswordReset).toHaveBeenCalledWith('user@fintra.dev');
    expect(
      await screen.findByText('If that email belongs to an account, a reset link is on the way.'),
    ).toBeInTheDocument();
  });

  it('shows service errors when reset link delivery fails', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      requestPasswordResetError: new Error('Email service unavailable.'),
    });

    await renderAppAtPath('/forgot-password', authService.service);

    await user.type(await screen.findByLabelText(/email/i), 'user@fintra.dev');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText('Email service unavailable.')).toBeInTheDocument();
  });
});
