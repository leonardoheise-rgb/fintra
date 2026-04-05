import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

import { translateAppText } from '../../../shared/i18n/appText';

type AuthPageLayoutProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  footerPrompt: string;
  footerActionLabel: string;
  footerActionHref: string;
  mode: 'sign-in' | 'sign-up';
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
        <div className="auth-page__brand">
          <div className="auth-page__brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M4 9.5L12 5l8 4.5" />
              <path d="M6.5 9.5V18M11 9.5V18M15.5 9.5V18M4 18h16" />
            </svg>
          </div>
          <span>{translateAppText('shell.brand')}</span>
        </div>

        <div className="auth-page__hero-copy">
          <p className="auth-page__eyebrow">
            {mode === 'sign-in'
              ? translateAppText('auth.highlightPrivateAccess')
              : translateAppText('auth.highlightMonthlyFocus')}
          </p>
          <h1>{translateAppText('auth.heroTitle')}</h1>
          <p className="auth-page__copy">{translateAppText('auth.heroCopy')}</p>
        </div>

        <div className="auth-page__highlights" aria-label="Workspace highlights">
          {mode === 'sign-in' ? (
            <>
              <article className="auth-page__highlight">
                <span>{translateAppText('auth.highlightMonthlyFocus')}</span>
                <strong>{translateAppText('auth.highlightMonthlyFocusCopy')}</strong>
              </article>
              <article className="auth-page__highlight">
                <span>{translateAppText('auth.highlightPrivateAccess')}</span>
                <strong>{translateAppText('auth.highlightPrivateAccessCopy')}</strong>
              </article>
            </>
          ) : (
            <blockquote className="auth-page__quote">
              <p>{translateAppText('auth.heroCopy')}</p>
              <footer>{translateAppText('auth.personalAccess')}</footer>
            </blockquote>
          )}
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
