import React from "react";
import { Box, Text, useStdout } from "ink";
import type { MailMessage } from "@cli/types/mail.ts";
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

interface Props {
  message: MailMessage;
  isCursor: boolean;
}

export function MailRow({ message, isCursor }: Props) {
  const { stdout } = useStdout();
  const cols = (stdout.columns ?? 80) - 1;

  const FROM_W = 20;
  const TIME_W = 10;
  // cursor(2) + unread(2) + from(FROM_W) + space(1) + subject + space(1) + time(TIME_W) + attach(2)
  const subjectW = Math.max(4, cols - 2 - 2 - FROM_W - 1 - 1 - TIME_W - 2);

  const from = (message.SenderName || message.SenderEmailAddress || "");
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
      <Text bold={message.Unread}>{fromStr}</Text>
      <Text> </Text>
      <Text bold={message.Unread}>{subjectStr}</Text>
      <Text> </Text>
      <Text dimColor>{timeStr}</Text>
      <Text dimColor>{message.HasAttachments ? " @" : "  "}</Text>
    </Box>
  );
}
