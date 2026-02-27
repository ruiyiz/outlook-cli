import React from "react";
import { Box, Text, useStdout } from "ink";
import type { CalendarEvent } from "@cli/types/calendar.ts";
import { theme } from "../theme.ts";

function formatEventTime(event: CalendarEvent): string {
  if (event.IsAllDayEvent) return "All day   ";
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${fmt(event.Start)}-${fmt(event.End)}`;
}

interface Props {
  event: CalendarEvent;
  isCursor: boolean;
}

export function EventRow({ event, isCursor }: Props) {
  const { stdout } = useStdout();
  const cols = (stdout.columns ?? 80) - 1;

  const TIME_W = 12;
  const LOC_W = 18;
  // cursor(2) + time(TIME_W) + space(1) + subject + space(1) + loc(LOC_W)
  const subjectW = Math.max(4, cols - 2 - TIME_W - 1 - 1 - LOC_W);

  const timeStr = formatEventTime(event).padEnd(TIME_W);
  const subject = event.Subject || "(no subject)";
  const subjectStr = subject.length > subjectW ? subject.slice(0, subjectW - 1) + "…" : subject.padEnd(subjectW);
  const loc = event.Location || "";
  const locStr = loc.length > LOC_W ? loc.slice(0, LOC_W - 1) + "…" : loc;

  return (
    <Box>
      <Text color={theme.selection}>{isCursor ? "❯" : " "}</Text>
      <Text> </Text>
      <Text color={theme.eventTime}>{timeStr}</Text>
      <Text> </Text>
      <Text bold>{subjectStr}</Text>
      <Text> </Text>
      <Text dimColor>{locStr}</Text>
    </Box>
  );
}
