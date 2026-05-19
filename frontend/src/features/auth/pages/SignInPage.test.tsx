import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createAuthServiceStub } from '../../../test/createAuthServiceStub';
import { renderAppAtPath } from '../../../test/renderAppAtPath';

describe('SignInPage', () => {
  it('validates empty credentials', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub();

    await renderAppAtPath('/sign-in', authService.service);

    await user.click(await screen.findByRole('button', { name: /^sign in$/i }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
  });

  it('links to the forgot password flow', async () => {
    const authService = createAuthServiceStub();

    await renderAppAtPath('/sign-in', authService.service);

    expect(await screen.findByRole('link', { name: /forgot your password/i })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  it('submits valid credentials and redirects to the dashboard', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub();

    await renderAppAtPath('/sign-in', authService.service);

    await user.type(await screen.findByLabelText(/email/i), 'user@fintra.dev');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(
      await screen.findByRole('heading', { name: /^dashboard$/i, level: 1 }, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it('shows service errors when sign in fails', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      signInError: new Error('Invalid login credentials.'),
    });

    await renderAppAtPath('/sign-in', authService.service);

    await user.type(await screen.findByLabelText(/email/i), 'user@fintra.dev');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(await screen.findByText('Invalid login credentials.')).toBeInTheDocument();
  });
});
