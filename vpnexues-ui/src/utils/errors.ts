/** Extracts the backend's GlobalExceptionHandler `message` field from an axios error, falling back otherwise. */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    // @ts-expect-error narrow axios error shape at runtime
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
}
