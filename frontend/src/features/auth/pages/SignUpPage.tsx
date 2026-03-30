import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { resolveAppErrorMessage } from '../../../shared/i18n/appErrors';
import { translateAppText } from '../../../shared/i18n/appText';
import { useAuth } from '../useAuth';
import { AuthPageLayout } from '../components/AuthPageLayout';

function validateSignUpForm(email: string, password: string, confirmPassword: string) {
  const errors: string[] = [];

  if (!email.trim()) {
    errors.push(translateAppText('auth.validationEmailRequired'));
  }

  if (password.trim().length < 8) {
    errors.push(translateAppText('auth.validationPasswordLength'));
  }

  if (password !== confirmPassword) {
    errors.push(translateAppText('auth.validationPasswordMatch'));
  }

  return errors;
}

export function SignUpPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    auth.clearError();
    setSuccessMessage(null);

    const validationErrors = validateSignUpForm(email, password, confirmPassword);

    if (validationErrors.length > 0) {
      setFormError(validationErrors[0]);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = await auth.signUp({
        email,
        password,
      });

      if (result.requiresEmailConfirmation) {
        setSuccessMessage(translateAppText('auth.confirmEmailMessage'));
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      setFormError(resolveAppErrorMessage(error, 'auth.errorUnableToCreateAccount'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageLayout
      description={translateAppText('auth.signUpDescription')}
      eyebrow={translateAppText('auth.newAccount')}
      footerActionHref="/sign-in"
      footerActionLabel={translateAppText('auth.signIn')}
      footerPrompt={translateAppText('auth.alreadyHaveAccount')}
      title={translateAppText('auth.createAccount')}
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

        <label className="auth-field">
          <span>{translateAppText('auth.password')}</span>
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
          {isSubmitting ? translateAppText('auth.creatingAccount') : translateAppText('auth.createAccount')}
        </button>
      </form>

      <p className="auth-card__microcopy">
        {translateAppText('auth.preferExistingAccount')}{' '}
        <Link to="/sign-in">{translateAppText('auth.signInHere')}</Link>
      </p>
    </AuthPageLayout>
  );
}
