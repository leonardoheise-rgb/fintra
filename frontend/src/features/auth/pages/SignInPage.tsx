import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../useAuth';
import { AuthPageLayout } from '../components/AuthPageLayout';

function validateSignInForm(email: string, password: string) {
  const errors: string[] = [];

  if (!email.trim()) {
    errors.push('Email is required.');
  }

  if (!password.trim()) {
    errors.push('Password is required.');
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
      setFormError(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageLayout
      description="Sign in to return to your monthly view, recent activity, and personal budget plan."
      eyebrow="Welcome back"
      footerActionHref="/sign-up"
      footerActionLabel="Create an account"
      footerPrompt="Need an account?"
      title="Sign in"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Email</span>
          <input
            autoComplete="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
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
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="auth-card__microcopy">
        New here? <Link to="/sign-up">Set up your account</Link>
      </p>
    </AuthPageLayout>
  );
}
