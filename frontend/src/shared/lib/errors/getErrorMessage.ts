type ErrorLike = {
  message?: unknown;
};

export function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ErrorLike).message === 'string' &&
    (error as ErrorLike).message
  ) {
    return (error as ErrorLike).message as string;
  }

  return fallbackMessage;
}
