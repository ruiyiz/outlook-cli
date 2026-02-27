import React from "react";
import { Box, Text } from "ink";
import { useAppState } from "../context.ts";
import { theme } from "../theme.ts";

interface Props {
  unreadCount: number;
  loading: boolean;
}

export function Header({ unreadCount, loading }: Props) {
  const { state } = useAppState();
  const isInbox = state.view === "inbox";
  const inboxLabel = unreadCount > 0 ? ` Inbox (${unreadCount}) ` : " Inbox ";

  return (
    <Box borderStyle="single" borderLeft={false} borderRight={false} paddingX={1} gap={1} marginBottom={1}>
      {isInbox ? (
        <Text bold backgroundColor={theme.accent} color={theme.accentFg}>{inboxLabel}</Text>
      ) : (
        <Text dimColor>{inboxLabel}</Text>
      )}
      {!isInbox ? (
        <Text bold backgroundColor={theme.accent} color={theme.accentFg}> Calendar </Text>
      ) : (
        <Text dimColor> Calendar </Text>
      )}
      {loading && <Text dimColor> syncing…</Text>}
    </Box>
  );
}
