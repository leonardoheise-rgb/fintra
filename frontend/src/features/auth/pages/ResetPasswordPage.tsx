import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { resolveAppErrorMessage } from '../../../shared/i18n/appErrors';
import { translateAppText } from '../../../shared/i18n/appText';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { validateNewPassword } from '../lib/passwordValidation';
import { useAuth } from '../useAuth';

export function ResetPasswordPage() {
  const auth = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    auth.clearError();
    setSuccessMessage(null);

    const validationError = validateNewPassword(password, confirmPassword);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await auth.updatePassword(password);
      setPassword('');
      setConfirmPassword('');
      setSuccessMessage(translateAppText('auth.passwordUpdated'));
    } catch (error) {
      setFormError(resolveAppErrorMessage(error, 'auth.errorUnableToUpdatePassword'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageLayout
      description={translateAppText('auth.resetPasswordDescription')}
      eyebrow={translateAppText('auth.passwordHelp')}
      footerActionHref="/sign-in"
      footerActionLabel={translateAppText('auth.signIn')}
      footerPrompt={translateAppText('auth.readyToContinue')}
      mode="forgot-password"
      title={translateAppText('auth.resetPassword')}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>{translateAppText('auth.newPassword')}</span>
          <input
            autoComplete="new-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>

        <label className="auth-field">
          <span>{translateAppText('auth.confirmPassword')}</span>
          <input
            autoComplete="new-password"
            name="confirmPassword"
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            value={confirmPassword}
          />
        </label>

        {formError ? <p className="auth-form__error">{formError}</p> : null}
        {successMessage ? <p className="auth-form__success">{successMessage}</p> : null}

        <button className="primary-button auth-form__button" disabled={isSubmitting} type="submit">
          {isSubmitting
            ? translateAppText('auth.updatingPassword')
            : translateAppText('auth.updatePassword')}
        </button>
      </form>

      <p className="auth-card__microcopy">
        <Link to="/sign-in">{translateAppText('auth.backToSignIn')}</Link>
      </p>
    </AuthPageLayout>
  );
}
