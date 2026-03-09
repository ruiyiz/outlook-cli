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

export function CalendarView({ events, loading, error, viewportHeight, isActive }: CalendarData & { viewportHeight: number; isActive: boolean }) {
  const { state, dispatch } = useAppState();

  const clamp = useCallback(
    (idx: number) => Math.max(0, Math.min(idx, events.length - 1)),
    [events.length]
  );

  useEffect(() => {
    if (!isActive) return;
    if (events.length > 0 && state.cursorIndex >= events.length) {
      dispatch({ type: "SET_CURSOR", index: 0 });
    }
  }, [isActive, state.cursorIndex, events.length, dispatch]);

  // Group events by day for section headers (safe to compute even when empty)
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

  // Compute rendered line numbers for each rows[] entry (non-first headers consume an extra margin line)
  let line = 0;
  const rowLines: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].type === "header" && i > 0) line += 1; // margin line
    rowLines.push(line);
    line += 1;
  }
  const totalRenderedRows = line;

  // Find the rendered line of the cursor event
  const cursorRowIndex = rows.findIndex((r) => r.type === "event" && r.idx === state.cursorIndex);
  const cursorRow = cursorRowIndex >= 0 ? rowLines[cursorRowIndex] : 0;

  function adjustScroll(cr: number, offset: number): number {
    let next = offset;
    if (cr < next) next = cr;
    if (cr >= next + viewportHeight) next = cr - viewportHeight + 1;
    return Math.max(0, Math.min(next, Math.max(0, totalRenderedRows - viewportHeight)));
  }

  const scrollOffset = adjustScroll(cursorRow, state.scrollOffset);

  useInput((input, key) => {
    let newCursor = state.cursorIndex;
    if (input === "j" || key.downArrow) {
      newCursor = clamp(state.cursorIndex + 1);
    } else if (input === "k" || key.upArrow) {
      newCursor = clamp(state.cursorIndex - 1);
    } else if (key.pageUp) {
      newCursor = clamp(state.cursorIndex - viewportHeight);
    } else if (key.pageDown) {
      newCursor = clamp(state.cursorIndex + viewportHeight);
    } else {
      return;
    }
    // Find rendered line for new cursor position
    const newCursorRowIndex = rows.findIndex((r) => r.type === "event" && r.idx === newCursor);
    const newCursorRow = newCursorRowIndex >= 0 ? rowLines[newCursorRowIndex] : 0;
    dispatch({ type: "SET_CURSOR", index: newCursor });
    dispatch({ type: "SET_SCROLL", offset: adjustScroll(newCursorRow, state.scrollOffset) });
  }, { isActive });

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

  // Render only rows whose rendered lines fall within the visible window
  const visibleElements: React.ReactNode[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowLine = rowLines[i];

    if (row.type === "header" && i > 0) {
      const marginLine = rowLine - 1;
      if (marginLine >= scrollOffset && marginLine < scrollOffset + viewportHeight) {
        visibleElements.push(<Box key={`margin-${i}`}><Text> </Text></Box>);
      }
    }

    if (rowLine >= scrollOffset && rowLine < scrollOffset + viewportHeight) {
      if (row.type === "header") {
        visibleElements.push(
          <Box key={`h-${i}`}>
            <Text bold color={theme.accent as any}>{row.label}</Text>
          </Box>
        );
      } else {
        visibleElements.push(
          <EventRow key={row.event.EntryID} event={row.event} isCursor={row.idx === state.cursorIndex} />
        );
      }
    }
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      {visibleElements}
    </Box>
  );
}
