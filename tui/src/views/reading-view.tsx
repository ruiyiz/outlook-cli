import React, { useEffect, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import { convert } from "html-to-text";
import { useAppState } from "../context.ts";
import { useReadMessage } from "../hooks/use-read-message.ts";
import { markThreadPredecessorsRead } from "../utils/mark-thread-read.ts";
import { wrapText } from "../utils/wrap-text.ts";
import { theme } from "../theme.ts";
import type { MailMessage } from "@cli/types/mail.ts";

interface Props {
  entryId: string;
  threadMessages: MailMessage[];
  viewportHeight: number;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getBodyText(msg: MailMessage): string {
  // BodyFormat: 1=Plain, 2=HTML, 3=RichText
  if (msg.BodyFormat === 1 && msg.Body?.trim()) {
    return msg.Body;
  }
  if (msg.HTMLBody?.trim()) {
    return convert(msg.HTMLBody, {
      wordwrap: false,
      selectors: [
        { selector: "img", format: "skip" },
        { selector: "a", options: { ignoreHref: true } },
      ],
    });
  }
  return msg.Body ?? "";
}

export function ReadingView({ entryId, threadMessages, viewportHeight, onClose }: Props) {
  const { state, dispatch } = useAppState();
  const { message, loading, error } = useReadMessage(entryId);

  useEffect(() => {
    markThreadPredecessorsRead(threadMessages, entryId).catch(() => {});
  }, [entryId]);

  const bodyLines = useMemo(() => {
    if (!message) return [];
    const text = getBodyText(message);
    const cols = process.stdout.columns ?? 80;
    const bodyWidth = Math.max(20, cols - 4);
    return wrapText(text, bodyWidth);
  }, [message]);

  // Fixed header lines: From, To, CC, Date, Subject, (Attachments)
  const headerLineCount = useMemo(() => {
    if (!message) return 0;
    let count = 4; // From, To, Date, Subject
    if (message.CC?.trim()) count++;
    if (message.HasAttachments) count++;
    count++; // separator blank line
    return count;
  }, [message]);

  const scrollableHeight = Math.max(1, viewportHeight - headerLineCount);
  const maxScroll = Math.max(0, bodyLines.length - scrollableHeight);

  useInput((input, key) => {
    if (key.escape || input === "q") {
      onClose();
      return;
    }
    let offset = state.readingScrollOffset;
    if (input === "j" || key.downArrow) {
      offset = Math.min(maxScroll, offset + 1);
    } else if (input === "k" || key.upArrow) {
      offset = Math.max(0, offset - 1);
    } else if (key.pageDown) {
      offset = Math.min(maxScroll, offset + scrollableHeight);
    } else if (key.pageUp) {
      offset = Math.max(0, offset - scrollableHeight);
    } else {
      return;
    }
    dispatch({ type: "SET_READING_SCROLL", offset });
  });

  if (loading) {
    return (
      <Box paddingX={1} paddingY={1}>
        <Text dimColor>Loading message…</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box paddingX={1} paddingY={1}>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (!message) return null;

  const visibleLines = bodyLines.slice(state.readingScrollOffset, state.readingScrollOffset + scrollableHeight);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box flexDirection="column">
        <Box>
          <Text bold color={theme.selection}>From: </Text>
          <Text>{message.SenderName} &lt;{message.SenderEmailAddress}&gt;</Text>
        </Box>
        <Box>
          <Text bold color={theme.selection}>To:   </Text>
          <Text>{message.To ?? ""}</Text>
        </Box>
        {message.CC?.trim() && (
          <Box>
            <Text bold color={theme.selection}>CC:   </Text>
            <Text>{message.CC}</Text>
          </Box>
        )}
        <Box>
          <Text bold color={theme.selection}>Date: </Text>
          <Text>{new Date(message.ReceivedTime).toLocaleString()}</Text>
        </Box>
        <Box>
          <Text bold color={theme.selection}>Subj: </Text>
          <Text bold>{message.Subject}</Text>
        </Box>
        {message.HasAttachments && message.Attachments && (
          <Box>
            <Text bold color={theme.selection}>Att:  </Text>
            <Text dimColor>
              {message.Attachments.map((a) => `${a.FileName} (${formatBytes(a.Size)})`).join(", ")}
            </Text>
          </Box>
        )}
      </Box>
      <Box>
        <Text dimColor>{"─".repeat(Math.max(10, (process.stdout.columns ?? 80) - 4))}</Text>
      </Box>
      <Box flexDirection="column">
        {visibleLines.map((line, i) => (
          <Text key={state.readingScrollOffset + i}>{line}</Text>
        ))}
      </Box>
    </Box>
  );
}
