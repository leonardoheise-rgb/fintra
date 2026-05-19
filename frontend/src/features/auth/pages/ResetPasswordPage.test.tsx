import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

import { createAuthServiceStub } from '../../../test/createAuthServiceStub';
import { renderAppAtPath } from '../../../test/renderAppAtPath';

describe('ResetPasswordPage', () => {
  it('validates password confirmation', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub();

    await renderAppAtPath('/reset-password', authService.service);

    await user.type(await screen.findByLabelText(/new password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password321');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText('Password confirmation must match.')).toBeInTheDocument();
    expect(authService.service.updatePassword).not.toHaveBeenCalled();
  });

  it('updates the password when the form is valid', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub();

    await renderAppAtPath('/reset-password', authService.service);

    await user.type(await screen.findByLabelText(/new password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(authService.service.updatePassword).toHaveBeenCalledWith('password123');
    expect(await screen.findByText('Your password has been updated.')).toBeInTheDocument();
  });

  it('shows service errors when password update fails', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      updatePasswordError: new Error('Recovery session expired.'),
    });

    await renderAppAtPath('/reset-password', authService.service);

    await user.type(await screen.findByLabelText(/new password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText('Recovery session expired.')).toBeInTheDocument();
  });
});
