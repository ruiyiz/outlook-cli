import { useState, useEffect } from "react";
import { createExecutor } from "@cli/executor/index.ts";
import type { MailMessage } from "@cli/types/mail.ts";

export function useReadMessage(entryId: string | null) {
  const [message, setMessage] = useState<MailMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entryId) {
      setMessage(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setMessage(null);
    (async () => {
      try {
        const executor = await createExecutor();
        const result = await executor.execute<MailMessage>("mail", "read-message", { entryId });
        if (cancelled) return;
        if (result.success && result.data) {
          setMessage(result.data);
        } else {
          setError(result.error ?? "Failed to read message");
        }
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [entryId]);

  return { message, loading, error };
}
