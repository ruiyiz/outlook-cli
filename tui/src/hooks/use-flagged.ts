import { useState, useCallback, useRef, useMemo } from "react";
import { createExecutor } from "@cli/executor/index.ts";
import { loadConfig } from "@cli/lib/config.ts";
import type { MailMessage, ThreadedMessage } from "@cli/types/mail.ts";
import { threadMessages } from "../utils/thread-messages.ts";

const FLAGGED_LIMIT = 100;

export interface FlaggedData {
  flaggedThreads: ThreadedMessage[];
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  refresh: () => void;
}

export function useFlagged(): FlaggedData {
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await loadConfig();
      const executor = await createExecutor();
      const result = await executor.execute<MailMessage | MailMessage[]>("mail", "list-flagged", {
        limit: FLAGGED_LIMIT,
        folder: config.defaultFolder,
      });
      if (result.success) {
        const msgs = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
        setMessages(msgs);
        setLastRefresh(new Date());
      } else {
        setError(result.error ?? "Failed to fetch flagged messages");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRef = useRef(fetchMessages);
  fetchRef.current = fetchMessages;

  const flaggedThreads = useMemo(() => threadMessages(messages), [messages]);

  return { flaggedThreads, loading, error, lastRefresh, refresh: fetchMessages, };
}
