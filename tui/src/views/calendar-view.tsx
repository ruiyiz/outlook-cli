import React, { useCallback, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { useAppState } from "../context.ts";
import { EventRow } from "../components/event-row.tsx";
import type { CalendarData } from "../hooks/use-calendar.ts";
import type { CalendarEvent } from "@cli/types/calendar.ts";
import { theme } from "../theme.ts";

function dayKey(iso: string): string {
  return new Date(iso).toDateString();
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

export function CalendarView({ events, loading, error }: CalendarData) {
  const { state, dispatch } = useAppState();

  const clamp = useCallback(
    (idx: number) => Math.max(0, Math.min(idx, events.length - 1)),
    [events.length]
  );

  useEffect(() => {
    if (events.length > 0 && state.cursorIndex >= events.length) {
      dispatch({ type: "SET_CURSOR", index: 0 });
    }
  }, [state.cursorIndex, events.length, dispatch]);

  useInput((input, key) => {
    if (input === "j" || key.downArrow) {
      dispatch({ type: "SET_CURSOR", index: clamp(state.cursorIndex + 1) });
    } else if (input === "k" || key.upArrow) {
      dispatch({ type: "SET_CURSOR", index: clamp(state.cursorIndex - 1) });
    } else if (key.pageUp) {
      dispatch({ type: "SET_CURSOR", index: 0 });
    } else if (key.pageDown) {
      dispatch({ type: "SET_CURSOR", index: clamp(events.length - 1) });
    }
  });

  if (error) {
    return (
      <Box paddingX={1} paddingY={1}>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (loading && events.length === 0) {
    return (
      <Box paddingX={1} paddingY={1}>
        <Text dimColor>Loading calendar…</Text>
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box paddingX={1} paddingY={1}>
        <Text dimColor>No events in the next 7 days.</Text>
      </Box>
    );
  }

  // Group events by day for section headers
  let lastDay = "";
  const rows: Array<{ type: "header"; label: string } | { type: "event"; event: CalendarEvent; idx: number }> = [];
  events.forEach((event, idx) => {
    const dk = dayKey(event.Start);
    if (dk !== lastDay) {
      rows.push({ type: "header", label: dayLabel(event.Start) });
      lastDay = dk;
    }
    rows.push({ type: "event", event, idx });
  });

  return (
    <Box flexDirection="column" paddingX={1}>
      {rows.map((row, i) => {
        if (row.type === "header") {
          return (
            <Box key={`h-${i}`} marginTop={i > 0 ? 1 : 0}>
              <Text bold color={theme.accent as any}>{row.label}</Text>
            </Box>
          );
        }
        return (
          <EventRow key={row.event.EntryID} event={row.event} isCursor={row.idx === state.cursorIndex} />
        );
      })}
    </Box>
  );
}
