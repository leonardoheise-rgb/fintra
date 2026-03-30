import { translateAppText } from '../../../shared/i18n/appText';

export function AuthGateFallback() {
  return (
    <main className="auth-status-screen" aria-live="polite">
      <div className="auth-status-screen__panel">
        <p className="auth-status-screen__eyebrow">{translateAppText('auth.sessionCheck')}</p>
        <h1>{translateAppText('auth.checkingWorkspace')}</h1>
        <p>{translateAppText('auth.checkingWorkspaceCopy')}</p>
      </div>
    </main>
  );
}
