import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

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
        <h1>Money clarity with an editorial calm.</h1>
        <p className="auth-page__copy">
          A calmer place to manage your monthly plan, review your spending, and keep steady
          financial habits.
        </p>
        <div className="auth-page__highlights" aria-label="Workspace highlights">
          <article className="auth-page__highlight">
            <span>Monthly focus</span>
            <strong>See your plan, movement, and progress in one flow</strong>
          </article>
          <article className="auth-page__highlight">
            <span>Private access</span>
            <strong>Your workspace stays personal every time you sign in</strong>
          </article>
        </div>
        <div className="auth-page__mode">Personal access</div>
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
