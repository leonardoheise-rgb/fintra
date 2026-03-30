import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { resolveAppErrorMessage } from '../../../shared/i18n/appErrors';
import { translateAppText } from '../../../shared/i18n/appText';
import { useAuth } from '../useAuth';
import { AuthPageLayout } from '../components/AuthPageLayout';

function validateSignInForm(email: string, password: string) {
  const errors: string[] = [];

  if (!email.trim()) {
    errors.push(translateAppText('auth.validationEmailRequired'));
  }

  if (!password.trim()) {
    errors.push(translateAppText('auth.validationPasswordRequired'));
  }

  return errors;
}

export function SignInPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTarget = location.state?.from?.pathname ?? '/';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    auth.clearError();

    const validationErrors = validateSignInForm(email, password);

    if (validationErrors.length > 0) {
      setFormError(validationErrors[0]);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await auth.signIn({
        email,
        password,
      });

      navigate(redirectTarget, { replace: true });
    } catch (error) {
      setFormError(resolveAppErrorMessage(error, 'auth.errorUnableToSignIn'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageLayout
      description={translateAppText('auth.signInDescription')}
      eyebrow={translateAppText('auth.welcomeBack')}
      footerActionHref="/sign-up"
      footerActionLabel={translateAppText('auth.createAnAccount')}
      footerPrompt={translateAppText('auth.needAccount')}
      title={translateAppText('auth.signIn')}
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
            autoComplete="current-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>

        {formError ? <p className="auth-form__error">{formError}</p> : null}

        <button className="primary-button auth-form__button" disabled={isSubmitting} type="submit">
          {isSubmitting ? translateAppText('auth.signingIn') : translateAppText('auth.signIn')}
        </button>
      </form>

      <p className="auth-card__microcopy">
        {translateAppText('auth.newHere')} <Link to="/sign-up">{translateAppText('auth.setUpYourAccount')}</Link>
      </p>
    </AuthPageLayout>
  );
}
