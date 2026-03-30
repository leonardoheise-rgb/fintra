import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

type AuthPageLayoutProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  footerPrompt: string;
  footerActionLabel: string;
  footerActionHref: string;
  mode: 'preview' | 'supabase';
}>;

export function AuthPageLayout({
  children,
  description,
  eyebrow,
  footerActionHref,
  footerActionLabel,
  footerPrompt,
  mode,
  title,
}: AuthPageLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-page__hero">
        <p className="auth-page__eyebrow">Fintra</p>
        <h1>Money clarity with an editorial calm.</h1>
        <p className="auth-page__copy">
          Sprint 1 adds authentication, protected routes, and a session-aware shell so the finance
          workflows can be safely attached to real user accounts.
        </p>
        <div className="auth-page__highlights" aria-label="Workspace highlights">
          <article className="auth-page__highlight">
            <span>Protected shell</span>
            <strong>Private pages stay scoped to your account</strong>
          </article>
          <article className="auth-page__highlight">
            <span>Live hierarchy</span>
            <strong>Budgets, transactions, and insights stay visually organized</strong>
          </article>
        </div>
        <div className="auth-page__mode">
          {mode === 'preview' ? 'Preview auth mode' : 'Supabase auth mode'}
        </div>
      </section>

      <section className="auth-card" aria-labelledby="auth-title">
        <p className="auth-card__eyebrow">{eyebrow}</p>
        <h2 id="auth-title">{title}</h2>
        <p className="auth-card__description">{description}</p>

        {children}

        <p className="auth-card__footer">
          {footerPrompt} <Link to={footerActionHref}>{footerActionLabel}</Link>
        </p>
      </section>
    </main>
  );
}
