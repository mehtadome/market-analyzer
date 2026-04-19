interface RetryOptions {
  attempts?: number;   // total tries including the first
  baseDelayMs?: number;
}

// Retries fn on failure with exponential backoff. Throws the last error if all attempts fail.
export async function withRetry<T>(fn: () => Promise<T>, { attempts = 3, baseDelayMs = 500 }: RetryOptions = {}): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** i));
      }
    }
  }
  throw lastError;
}
