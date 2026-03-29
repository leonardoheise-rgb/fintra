import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createAuthServiceStub } from '../test/createAuthServiceStub';
import { renderAppAtPath } from '../test/renderAppAtPath';

describe('App authentication routing', () => {
  it('redirects unauthenticated users to sign in', async () => {
    const authService = createAuthServiceStub();

    renderAppAtPath('/', authService.service);

    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows the dashboard for authenticated users', async () => {
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    renderAppAtPath('/', authService.service);

    expect(await screen.findByRole('heading', { name: /wealth in motion/i })).toBeInTheDocument();
    expect(screen.getByText('owner@fintra.dev')).toBeInTheDocument();
  });

  it('redirects authenticated users away from the sign-in page', async () => {
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    renderAppAtPath('/sign-in', authService.service);

    expect(await screen.findByRole('heading', { name: /wealth in motion/i })).toBeInTheDocument();
  });

  it('signs the user out from the protected shell', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    renderAppAtPath('/', authService.service);

    await user.click(await screen.findByRole('button', { name: /sign out/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });
  });
});
