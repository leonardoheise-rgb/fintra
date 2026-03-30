import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../useAuth';
import { AuthPageLayout } from '../components/AuthPageLayout';

function validateSignUpForm(email: string, password: string, confirmPassword: string) {
  const errors: string[] = [];

  if (!email.trim()) {
    errors.push('Email is required.');
  }

  if (password.trim().length < 8) {
    errors.push('Password must be at least 8 characters.');
  }

  if (password !== confirmPassword) {
    errors.push('Password confirmation must match.');
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
        setSuccessMessage('Check your email to confirm the account before signing in.');
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create the account right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageLayout
      description="Create your account to build a personal space for your monthly plan, spending, and progress."
      eyebrow="New account"
      footerActionHref="/sign-in"
      footerActionLabel="Sign in"
      footerPrompt="Already have an account?"
      title="Create your account"
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
            autoComplete="new-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>

        <label className="auth-field">
          <span>Confirm password</span>
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
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="auth-card__microcopy">
        Prefer to continue with an existing account? <Link to="/sign-in">Sign in here</Link>
      </p>
    </AuthPageLayout>
  );
}
