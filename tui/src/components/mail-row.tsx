import React from "react";
import { Box, Text, useStdout } from "ink";
import type { MailMessage, ThreadedMessage } from "@cli/types/mail.ts";
import { theme } from "../theme.ts";

function formatMailTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

type Props =
  | { kind: "thread"; thread: ThreadedMessage; isCursor: boolean; fullyLoaded: boolean; isLoading: boolean; displayCount: number }
  | { kind: "child"; message: MailMessage; isCursor: boolean };

export function MailRow(props: Props) {
  const { stdout } = useStdout();
  const cols = (stdout.columns ?? 80) - 2; // -2 for paddingX={1} in parent

  if (props.kind === "thread") {
    const { thread, isCursor } = props;
    const { fullyLoaded, isLoading, displayCount } = props;
    const isMulti = displayCount > 1;
    const badge = isMulti
      ? (isLoading ? `[${displayCount}…]` : fullyLoaded ? `[${displayCount}]` : `[${displayCount}+]`)
      : "";
    const FROM_W = 20;
    const TIME_W = 10;
    // badge takes: badge.length + 1 space if present
    const badgeW = isMulti ? badge.length + 1 : 0;
    // trailing: attach(2) + flag(2)
    const subjectW = Math.max(4, cols - 2 - 2 - FROM_W - 1 - badgeW - 1 - TIME_W - 2 - 2);

    const from = thread.latestSenderName;
    const fromStr = from.length > FROM_W ? from.slice(0, FROM_W - 1) + "…" : from.padEnd(FROM_W);
    const topic = thread.conversationTopic;
    const subjectStr = topic.length > subjectW ? topic.slice(0, subjectW - 1) + "…" : topic.padEnd(subjectW);
    const timeStr = formatMailTime(thread.latestReceivedTime).padStart(TIME_W);

    return (
      <Box>
        <Text color={theme.selection}>{isCursor ? "❯" : " "}</Text>
        <Text> </Text>
        <Text color={thread.hasUnread ? theme.selection : undefined} dimColor={!thread.hasUnread}>
          {thread.hasUnread ? "●" : "○"}
        </Text>
        <Text> </Text>
        <Text bold={thread.hasUnread}>{fromStr}</Text>
        <Text> </Text>
        {isMulti && <Text color={theme.selection} bold>{badge}</Text>}
        {isMulti && <Text> </Text>}
        <Text bold={thread.hasUnread}>{subjectStr}</Text>
        <Text> </Text>
        <Text dimColor>{timeStr}</Text>
        <Text dimColor>{thread.hasAttachments ? " @" : "  "}</Text>
        <Text color="yellow">{thread.hasFlagged ? " ⚑" : "  "}</Text>
      </Box>
    );
  }

  // kind === "child"
  const { message, isCursor } = props;
  const INDENT = 2;
  const FROM_W = 18;
  const TIME_W = 10;
  // cursor(2) + unread(2) + indent(2) + from(FROM_W) + space(1) + subject + space(1) + time(TIME_W) + attach(2) + flag(2)
  const subjectW = Math.max(4, cols - 2 - 2 - INDENT - FROM_W - 1 - 1 - TIME_W - 2 - 2);

  const from = message.SenderName || message.SenderEmailAddress || "";
  const fromStr = from.length > FROM_W ? from.slice(0, FROM_W - 1) + "…" : from.padEnd(FROM_W);
  const subject = message.Subject || "(no subject)";
  const subjectStr = subject.length > subjectW ? subject.slice(0, subjectW - 1) + "…" : subject.padEnd(subjectW);
  const timeStr = formatMailTime(message.ReceivedTime).padStart(TIME_W);

  return (
    <Box>
      <Text color={theme.selection}>{isCursor ? "❯" : " "}</Text>
      <Text> </Text>
      <Text color={message.Unread ? theme.selection : undefined} dimColor={!message.Unread}>
        {message.Unread ? "●" : "○"}
      </Text>
      <Text> </Text>
      <Text dimColor>{"╰ "}</Text>
      <Text bold={message.Unread}>{fromStr}</Text>
      <Text> </Text>
      <Text bold={message.Unread}>{subjectStr}</Text>
      <Text> </Text>
      <Text dimColor>{timeStr}</Text>
      <Text dimColor>{message.HasAttachments ? " @" : "  "}</Text>
      <Text color="yellow">{message.FlagStatus === 2 ? " ⚑" : "  "}</Text>
    </Box>
  );
}
