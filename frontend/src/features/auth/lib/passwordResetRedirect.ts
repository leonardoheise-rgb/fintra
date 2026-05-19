const resetPasswordPath = '/reset-password';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function resolvePasswordResetRedirectUrl(
  configuredAppUrl = import.meta.env.VITE_PUBLIC_APP_URL,
  currentOrigin = window.location.origin,
) {
  const baseUrl = trimTrailingSlash(configuredAppUrl?.trim() || currentOrigin);

  return `${baseUrl}${resetPasswordPath}`;
}
