// COM error: RPC_E_CALL_REJECTED when Outlook is busy
const RPC_E_CALL_REJECTED = "0x80010001";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function isRetryable(error: string): boolean {
  return error.includes(RPC_E_CALL_REJECTED) || error.includes("RPC_E_CALL_REJECTED");
}

export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (!isRetryable(msg) || attempt === MAX_RETRIES - 1) {
        throw err;
      }
      await Bun.sleep(RETRY_DELAY_MS);
    }
  }
  throw lastError;
}
