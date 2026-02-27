import React, { useCallback, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { useAppState } from "../context.ts";
import { MailRow } from "../components/mail-row.tsx";
import type { InboxData } from "../hooks/use-inbox.ts";

export function InboxView({ messages, loading, error }: InboxData) {
  const { state, dispatch } = useAppState();

  const clamp = useCallback(
    (idx: number) => Math.max(0, Math.min(idx, messages.length - 1)),
    [messages.length]
  );

  useEffect(() => {
    if (messages.length > 0 && state.cursorIndex >= messages.length) {
      dispatch({ type: "SET_CURSOR", index: 0 });
    }
  }, [state.cursorIndex, messages.length, dispatch]);

  useInput((input, key) => {
    if (input === "j" || key.downArrow) {
      dispatch({ type: "SET_CURSOR", index: clamp(state.cursorIndex + 1) });
    } else if (input === "k" || key.upArrow) {
      dispatch({ type: "SET_CURSOR", index: clamp(state.cursorIndex - 1) });
    } else if (key.pageUp) {
      dispatch({ type: "SET_CURSOR", index: 0 });
    } else if (key.pageDown) {
      dispatch({ type: "SET_CURSOR", index: clamp(messages.length - 1) });
    }
  });

  if (error) {
    return (
      <Box paddingX={1} paddingY={1}>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (loading && messages.length === 0) {
    return (
      <Box paddingX={1} paddingY={1}>
        <Text dimColor>Loading inbox…</Text>
      </Box>
    );
  }

  if (messages.length === 0) {
    return (
      <Box paddingX={1} paddingY={1}>
        <Text dimColor>No messages.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      {messages.map((msg, i) => (
        <MailRow key={msg.EntryID} message={msg} isCursor={i === state.cursorIndex} />
      ))}
    </Box>
  );
}
