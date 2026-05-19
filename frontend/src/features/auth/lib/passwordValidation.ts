import { translateAppText } from '../../../shared/i18n/appText';

export function validatePasswordResetRequest(email: string) {
  if (!email.trim()) {
    return translateAppText('auth.validationEmailRequired');
  }

  return null;
}

export function validateNewPassword(password: string, confirmPassword: string) {
  if (password.trim().length < 8) {
    return translateAppText('auth.validationPasswordLength');
  }

  if (password !== confirmPassword) {
    return translateAppText('auth.validationPasswordMatch');
  }

  return null;
}
