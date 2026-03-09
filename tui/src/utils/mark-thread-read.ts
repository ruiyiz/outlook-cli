import { createExecutor } from "@cli/executor/index.ts";
import type { MailMessage } from "@cli/types/mail.ts";

export async function markThreadPredecessorsRead(messages: MailMessage[], openedEntryId: string): Promise<void> {
  const opened = messages.find((m) => m.EntryID === openedEntryId);
  if (!opened) return;
  const openedTime = new Date(opened.ReceivedTime).getTime();
  const toMark = messages.filter(
    (m) => m.EntryID !== openedEntryId && m.Unread && new Date(m.ReceivedTime).getTime() <= openedTime
  );
  if (toMark.length === 0) return;
  const executor = await createExecutor();
  for (const msg of toMark) {
    executor.execute("mail", "mark-read", { entryId: msg.EntryID, markAsRead: true }).catch(() => {});
  }
}
