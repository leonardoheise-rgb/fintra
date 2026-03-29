export function AuthGateFallback() {
  return (
    <main className="auth-status-screen" aria-live="polite">
      <div className="auth-status-screen__panel">
        <p className="auth-status-screen__eyebrow">Session check</p>
        <h1>Checking your workspace</h1>
        <p>
          Fintra is confirming whether you already have an active session before choosing the
          correct route.
        </p>
      </div>
    </main>
  );
}
