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
}>;

export function AuthPageLayout({
  children,
  description,
  eyebrow,
  footerActionHref,
  footerActionLabel,
  footerPrompt,
  title,
}: AuthPageLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-page__hero">
        <p className="auth-page__eyebrow">Fintra</p>
        <h1>{translateAppText('auth.heroTitle')}</h1>
        <p className="auth-page__copy">{translateAppText('auth.heroCopy')}</p>
        <div className="auth-page__highlights" aria-label="Workspace highlights">
          <article className="auth-page__highlight">
            <span>{translateAppText('auth.highlightMonthlyFocus')}</span>
            <strong>{translateAppText('auth.highlightMonthlyFocusCopy')}</strong>
          </article>
          <article className="auth-page__highlight">
            <span>{translateAppText('auth.highlightPrivateAccess')}</span>
            <strong>{translateAppText('auth.highlightPrivateAccessCopy')}</strong>
          </article>
        </div>
        <div className="auth-page__mode">{translateAppText('auth.personalAccess')}</div>
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
