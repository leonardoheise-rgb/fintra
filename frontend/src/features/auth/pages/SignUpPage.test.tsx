import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createAuthServiceStub } from '../../../test/createAuthServiceStub';
import { renderAppAtPath } from '../../../test/renderAppAtPath';

describe('SignUpPage', () => {
  it('validates password confirmation', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub();

    await renderAppAtPath('/sign-up', authService.service);

    await user.type(await screen.findByLabelText(/^email$/i), 'user@fintra.dev');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password321');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Password confirmation must match.')).toBeInTheDocument();
  }, 10000);

  it('redirects to the dashboard after a successful registration', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub();

    await renderAppAtPath('/sign-up', authService.service);

    await user.type(await screen.findByLabelText(/^email$/i), 'user@fintra.dev');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByRole('heading', { name: /wealth in motion/i }, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it('shows a confirmation message when email verification is required', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      signUpRequiresEmailConfirmation: true,
      mode: 'supabase',
    });

    await renderAppAtPath('/sign-up', authService.service);

    await user.type(await screen.findByLabelText(/^email$/i), 'user@fintra.dev');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByText('Check your email to confirm the account before signing in.'),
    ).toBeInTheDocument();
  });
});
