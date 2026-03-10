/**
 * Retries a canister call when IC0508 (canister stopped) is encountered.
 * Uses exponential backoff: 2s, 4s, 8s, 15s, 30s (max 5 retries).
 */
export async function withCanisterRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  onRetry?: (attempt: number, total: number) => void,
): Promise<T> {
  const delays = [2000, 4000, 8000, 15000, 30000];
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isCanisterStopped =
        msg.includes("IC0508") ||
        msg.includes("canister is stopped") ||
        msg.includes("Canister is stopped");

      if (isCanisterStopped && attempt < maxRetries) {
        onRetry?.(attempt + 1, maxRetries);
        const delayMs = delays[attempt] ?? 30000;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        lastError = e;
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}
