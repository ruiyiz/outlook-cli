import React, { useCallback, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { useAppState } from "../context.ts";
import { MailRow } from "../components/mail-row.tsx";
import type { InboxData } from "../hooks/use-inbox.ts";

function adjustScroll(cursor: number, offset: number, viewport: number, total: number): number {
  let next = offset;
  if (cursor < next) next = cursor;
  if (cursor >= next + viewport) next = cursor - viewport + 1;
  return Math.max(0, Math.min(next, Math.max(0, total - viewport)));
}

export function InboxView({ messages, loading, error, viewportHeight }: InboxData & { viewportHeight: number }) {
  const { state, dispatch } = useAppState();

  const clamp = useCallback(
    (idx: number) => Math.max(0, Math.min(idx, messages.length - 1)),
    [messages.length]
  );

  useEffect(() => {
    if (messages.length > 0 && state.cursorIndex >= messages.length) {
      dispatch({ type: "SET_CURSOR", index: 0 });
      dispatch({ type: "SET_SCROLL", offset: 0 });
    }
  }, [state.cursorIndex, messages.length, dispatch]);

  // Both cursor and scroll are dispatched together inside Ink's batchedUpdates,
  // so they produce a single re-render with no intermediate frames.
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
    dispatch({ type: "SET_CURSOR", index: newCursor });
    dispatch({ type: "SET_SCROLL", offset: adjustScroll(newCursor, state.scrollOffset, viewportHeight, messages.length) });
  });

  const scrollOffset = adjustScroll(state.cursorIndex, state.scrollOffset, viewportHeight, messages.length);

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

  const visible = messages.slice(scrollOffset, scrollOffset + viewportHeight);

  return (
    <Box flexDirection="column" paddingX={1}>
      {visible.map((msg, i) => (
        <MailRow key={msg.EntryID} message={msg} isCursor={(scrollOffset + i) === state.cursorIndex} />
      ))}
    </Box>
  );
}
