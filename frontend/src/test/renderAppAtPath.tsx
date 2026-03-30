import { act, render } from '@testing-library/react';

import { App } from '../app/App';
import type { AuthService } from '../features/auth/services/authService';

export async function renderAppAtPath(pathname: string, authService: AuthService) {
  window.history.pushState({}, '', pathname);

  let renderResult: ReturnType<typeof render> | undefined;

  await act(async () => {
    renderResult = render(<App authService={authService} />);
    await Promise.resolve();
  });

  return renderResult!;
}
