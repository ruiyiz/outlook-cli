import type { MailMessage, ThreadedMessage } from "@cli/types/mail.ts";

export function threadMessages(messages: MailMessage[]): ThreadedMessage[] {
  const groups = new Map<string, MailMessage[]>();

  for (const msg of messages) {
    const key = msg.ConversationID || msg.EntryID;
    const group = groups.get(key);
    if (group) {
      group.push(msg);
    } else {
      groups.set(key, [msg]);
    }
  }

  const threads: ThreadedMessage[] = [];
  for (const [key, msgs] of groups) {
    msgs.sort((a, b) => new Date(b.ReceivedTime).getTime() - new Date(a.ReceivedTime).getTime());
    const latest = msgs[0];
    threads.push({
      conversationId: key,
      conversationTopic: latest.ConversationTopic || latest.Subject || "(no subject)",
      latestEntryID: latest.EntryID,
      latestSenderName: latest.SenderName || latest.SenderEmailAddress || "",
      latestReceivedTime: latest.ReceivedTime,
      messageCount: msgs.length,
      hasUnread: msgs.some((m) => m.Unread),
      hasAttachments: msgs.some((m) => m.HasAttachments),
      importance: Math.max(...msgs.map((m) => m.Importance)),
      messages: msgs,
    });
  }

  threads.sort((a, b) => new Date(b.latestReceivedTime).getTime() - new Date(a.latestReceivedTime).getTime());
  return threads;
}
