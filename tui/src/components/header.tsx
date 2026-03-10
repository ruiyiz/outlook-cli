import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { useAppState } from "../context.ts";
import { theme } from "../theme.ts";

interface Props {
  unreadCount: number;
  flaggedCount: number;
  loading: boolean;
  lastRefresh: Date | null;
}

export function Header({ unreadCount, flaggedCount, loading, lastRefresh }: Props) {
  const { state } = useAppState();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  function Tab({ name, label }: { name: string; label: string }) {
    const active = state.view === name;
    return active
      ? <Text bold backgroundColor={theme.accent} color={theme.accentFg}> {label} </Text>
      : <Text dimColor> {label} </Text>;
  }

  const inboxLabel = unreadCount > 0 ? `Inbox (${unreadCount})` : "Inbox";
  const flaggedLabel = flaggedCount > 0 ? `Flagged (${flaggedCount})` : "Flagged";

  const syncStr = loading
    ? "syncing…"
    : lastRefresh
    ? `↻ ${lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "";

  const clockStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <Box borderStyle="single" borderLeft={false} borderRight={false} paddingX={1}>
      <Tab name="inbox" label={inboxLabel} />
      <Tab name="flagged" label={flaggedLabel} />
      <Tab name="calendar" label="Calendar" />
      <Box flexGrow={1} justifyContent="flex-end" gap={2}>
        {syncStr && <Text dimColor>{syncStr}</Text>}
        <Text dimColor>{clockStr}</Text>
      </Box>
    </Box>
  );
}
