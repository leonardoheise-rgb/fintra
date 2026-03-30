import { screen } from '@testing-library/react';

import { createAuthServiceStub } from '../../../test/createAuthServiceStub';
import { renderAppAtPath } from '../../../test/renderAppAtPath';

describe('DashboardPage', () => {
  it('renders live budget highlights from the finance workspace', async () => {
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    renderAppAtPath('/', authService.service);

    expect(
      await screen.findByRole('heading', { name: /wealth in motion/i }, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /^housing$/i, level: 4 }, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/selected month/i)).toBeInTheDocument();
  });
});
