import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Text, useInput } from "ink";
import { useAppState } from "../context.ts";
import { MailRow } from "../components/mail-row.tsx";
import type { InboxData } from "../hooks/use-inbox.ts";
import type { MailMessage, ThreadedMessage } from "@cli/types/mail.ts";
import { createExecutor } from "@cli/executor/index.ts";
import { loadConfig } from "@cli/lib/config.ts";

type Row =
  | { type: "thread"; thread: ThreadedMessage; flatIndex: number; fullyLoaded: boolean; isLoading: boolean; displayCount: number }
  | { type: "child"; message: MailMessage; thread: ThreadedMessage; flatIndex: number };

function buildRows(
  threads: ThreadedMessage[],
  expandedThreads: Set<string>,
  loadedConversations: Map<string, MailMessage[]>,
  loadingConversations: Set<string>,
): Row[] {
  const rows: Row[] = [];
  let flatIndex = 0;
  for (const thread of threads) {
    const loaded = loadedConversations.get(thread.conversationId);
    const fullyLoaded = loaded !== undefined;
    const isLoading = loadingConversations.has(thread.conversationId);
    const displayCount = loaded ? loaded.length : thread.messageCount;
    rows.push({ type: "thread", thread, flatIndex, fullyLoaded, isLoading, displayCount });
    flatIndex++;
    if (thread.messageCount > 1 && expandedThreads.has(thread.conversationId)) {
      const messages = loaded ?? thread.messages;
      for (const msg of messages) {
        rows.push({ type: "child", message: msg, thread, flatIndex });
        flatIndex++;
      }
    }
  }
  return rows;
}

export function InboxView({ threads, loading, error, viewportHeight, isActive }: Pick<InboxData, "threads" | "loading" | "error"> & { viewportHeight: number; isActive: boolean }) {
  const { state, dispatch } = useAppState();
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [loadedConversations, setLoadedConversations] = useState<Map<string, MailMessage[]>>(new Map());
  const [loadingConversations, setLoadingConversations] = useState<Set<string>>(new Set());
  const loadingRef = useRef(loadingConversations);
  loadingRef.current = loadingConversations;

  const rows = buildRows(threads, expandedThreads, loadedConversations, loadingConversations);
  const totalRows = rows.length;

  const clamp = useCallback(
    (idx: number) => Math.max(0, Math.min(idx, totalRows - 1)),
    [totalRows]
  );

  useEffect(() => {
    if (!isActive) return;
    if (totalRows > 0 && state.cursorIndex >= totalRows) {
      dispatch({ type: "SET_CURSOR", index: 0 });
      dispatch({ type: "SET_SCROLL", offset: 0 });
    }
  }, [isActive, state.cursorIndex, totalRows, dispatch]);

  const fetchConversation = useCallback(async (thread: ThreadedMessage) => {
    if (loadingRef.current.has(thread.conversationId)) return;
    setLoadingConversations((prev) => new Set([...prev, thread.conversationId]));
    try {
      const config = await loadConfig();
      const executor = await createExecutor();
      const result = await executor.execute<MailMessage | MailMessage[]>("mail", "get-conversation", {
        folder: config.defaultFolder,
        conversationId: thread.conversationId,
      });
      const msgs = result.success
        ? (Array.isArray(result.data) ? result.data : result.data ? [result.data] : thread.messages)
        : thread.messages;
      msgs.sort((a, b) => new Date(b.ReceivedTime).getTime() - new Date(a.ReceivedTime).getTime());
      setLoadedConversations((prev) => new Map([...prev, [thread.conversationId, msgs]]));
    } finally {
      setLoadingConversations((prev) => {
        const next = new Set(prev);
        next.delete(thread.conversationId);
        return next;
      });
    }
  }, []);

  function adjustScroll(cursor: number, offset: number): number {
    let next = offset;
    if (cursor < next) next = cursor;
    if (cursor >= next + viewportHeight) next = cursor - viewportHeight + 1;
    return Math.max(0, Math.min(next, Math.max(0, totalRows - viewportHeight)));
  }

  useInput((input, key) => {
    let newCursor = state.cursorIndex;

    if (key.return) {
      const row = rows[state.cursorIndex];
      if (row?.type === "thread" && row.thread.messageCount === 1) {
        const msgs = loadedConversations.get(row.thread.conversationId) ?? row.thread.messages;
        dispatch({ type: "OPEN_READING", entryId: row.thread.latestEntryID, threadMessages: msgs });
        return;
      }
      if (row?.type === "child") {
        const msgs = loadedConversations.get(row.thread.conversationId) ?? row.thread.messages;
        dispatch({ type: "OPEN_READING", entryId: row.message.EntryID, threadMessages: msgs });
        return;
      }
      if (row?.type === "thread" && row.thread.messageCount > 1) {
        const id = row.thread.conversationId;
        const isExpanded = expandedThreads.has(id);
        if (!isExpanded && !loadedConversations.has(id)) {
          fetchConversation(row.thread);
        }
        setExpandedThreads((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      }
      return;
    }

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

    dispatch({ type: "SET_CURSOR_AND_SCROLL", index: newCursor, offset: adjustScroll(newCursor, state.scrollOffset) });
  }, { isActive });

  const scrollOffset = adjustScroll(state.cursorIndex, state.scrollOffset);

  if (error) {
    return (
      <Box paddingX={1} paddingY={1}>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (loading && threads.length === 0) {
    return (
      <Box paddingX={1} paddingY={1}>
        <Text dimColor>Loading inbox…</Text>
      </Box>
    );
  }

  if (threads.length === 0) {
    return (
      <Box paddingX={1} paddingY={1}>
        <Text dimColor>No messages.</Text>
      </Box>
    );
  }

  const visible = rows.slice(scrollOffset, scrollOffset + viewportHeight);

  return (
    <Box flexDirection="column" paddingX={1}>
      {visible.map((row) => {
        const isCursor = row.flatIndex === state.cursorIndex;
        if (row.type === "thread") {
          return (
            <MailRow
              key={row.thread.conversationId}
              kind="thread"
              thread={row.thread}
              isCursor={isCursor}
              fullyLoaded={row.fullyLoaded}
              isLoading={row.isLoading}
              displayCount={row.displayCount}
            />
          );
        }
        return <MailRow key={row.message.EntryID} kind="child" message={row.message} isCursor={isCursor} />;
      })}
    </Box>
  );
}
