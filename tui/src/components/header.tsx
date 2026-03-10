import React from "react";
import { Box, Text } from "ink";
import { useAppState } from "../context.ts";
import { theme } from "../theme.ts";

interface Props {
  unreadCount: number;
  flaggedCount: number;
  loading: boolean;
}

export function Header({ unreadCount, flaggedCount, loading }: Props) {
  const { state } = useAppState();

  function Tab({ name, label }: { name: string; label: string }) {
    const active = state.view === name;
    return active
      ? <Text bold backgroundColor={theme.accent} color={theme.accentFg}> {label} </Text>
      : <Text dimColor> {label} </Text>;
  }

  const inboxLabel = unreadCount > 0 ? `Inbox (${unreadCount})` : "Inbox";
  const flaggedLabel = flaggedCount > 0 ? `Flagged (${flaggedCount})` : "Flagged";

  return (
    <Box borderStyle="single" borderLeft={false} borderRight={false} paddingX={1}>
      <Tab name="inbox" label={inboxLabel} />
      <Tab name="flagged" label={flaggedLabel} />
      <Tab name="calendar" label="Calendar" />
      {loading && <Text dimColor> syncing…</Text>}
    </Box>
  );
}
