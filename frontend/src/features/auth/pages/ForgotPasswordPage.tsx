import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { resolveAppErrorMessage } from '../../../shared/i18n/appErrors';
import { translateAppText } from '../../../shared/i18n/appText';
import { AuthPageLayout } from '../components/AuthPageLayout';
import { validatePasswordResetRequest } from '../lib/passwordValidation';
import { useAuth } from '../useAuth';

export function ForgotPasswordPage() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    auth.clearError();
    setSuccessMessage(null);

    const validationError = validatePasswordResetRequest(email);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await auth.requestPasswordReset(email);
      setSuccessMessage(translateAppText('auth.passwordResetEmailSent'));
    } catch (error) {
      setFormError(resolveAppErrorMessage(error, 'auth.errorUnableToRequestPasswordReset'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageLayout
      description={translateAppText('auth.forgotPasswordDescription')}
      eyebrow={translateAppText('auth.passwordHelp')}
      footerActionHref="/sign-in"
      footerActionLabel={translateAppText('auth.signIn')}
      footerPrompt={translateAppText('auth.rememberPassword')}
      mode="forgot-password"
      title={translateAppText('auth.forgotPassword')}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>{translateAppText('auth.email')}</span>
          <input
            autoComplete="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>

        {formError ? <p className="auth-form__error">{formError}</p> : null}
        {successMessage ? <p className="auth-form__success">{successMessage}</p> : null}

        <button className="primary-button auth-form__button" disabled={isSubmitting} type="submit">
          {isSubmitting
            ? translateAppText('auth.sendingResetLink')
            : translateAppText('auth.sendResetLink')}
        </button>
      </form>

      <p className="auth-card__microcopy">
        <Link to="/sign-in">{translateAppText('auth.backToSignIn')}</Link>
      </p>
    </AuthPageLayout>
  );
}
