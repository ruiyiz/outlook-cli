import { useState, useEffect, useCallback, useRef } from "react";
import { createExecutor } from "@cli/executor/index.ts";
import type { CalendarEvent } from "@cli/types/calendar.ts";

const POLL_MS = 5 * 60 * 1000;

export interface CalendarData {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  refresh: () => void;
}

export function useCalendar(): CalendarData {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 23, 59, 59).toISOString();
      const executor = await createExecutor();
      const result = await executor.execute<CalendarEvent | CalendarEvent[]>("calendar", "list-events", {
        fromDate,
        toDate,
      });
      if (result.success) {
        const evts = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
        setEvents(evts);
        setLastRefresh(new Date());
      } else {
        setError(result.error ?? "Failed to fetch events");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRef = useRef(fetchEvents);
  fetchRef.current = fetchEvents;

  useEffect(() => {
    fetchEvents();
    const id = setInterval(() => { fetchRef.current(); }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  return { events, loading, error, lastRefresh, refresh: fetchEvents };
}
