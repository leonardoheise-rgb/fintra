import { render } from '@testing-library/react';

import { App } from '../app/App';
import type { AuthService } from '../features/auth/services/authService';

export function renderAppAtPath(pathname: string, authService: AuthService) {
  window.history.pushState({}, '', pathname);

  return render(<App authService={authService} />);
}
