import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createExecutor } from "@cli/executor/index.ts";
import { loadConfig } from "@cli/lib/config.ts";
import type { MailMessage, ThreadedMessage } from "@cli/types/mail.ts";
import { threadMessages } from "../utils/thread-messages.ts";

const POLL_MS = 2 * 60 * 1000;

export interface InboxData {
  messages: MailMessage[];
  threads: ThreadedMessage[];
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  refresh: () => void;
}

export function useInbox(): InboxData {
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await loadConfig();
      const executor = await createExecutor();
      const result = await executor.execute<MailMessage | MailMessage[]>("mail", "list-inbox", {
        limit: config.defaultLimit,
        folder: config.defaultFolder,
        filterUnread: false,
        filterFrom: "",
        filterSubject: "",
        filterSince: "",
      });
      if (result.success) {
        const msgs = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
        setMessages(msgs);
        setLastRefresh(new Date());
      } else {
        setError(result.error ?? "Failed to fetch messages");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRef = useRef(fetchMessages);
  fetchRef.current = fetchMessages;

  useEffect(() => {
    fetchMessages();
    const id = setInterval(() => { fetchRef.current(); }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const threads = useMemo(() => threadMessages(messages), [messages]);

  return { messages, threads, loading, error, lastRefresh, refresh: fetchMessages };
}
