import { defineCommand } from "citty";
import { createExecutor } from "../../executor";
import { formatMailList } from "../../lib/formatter";
import { saveIdCache } from "../../lib/id-cache";
import { ensureConfigDir, loadConfig } from "../../lib/config";
import type { MailMessage } from "../../types/mail";

const list = defineCommand({
  meta: {
    name: "list",
    description: "List mail messages",
  },
  args: {
    limit: { type: "string", description: "Number of messages to show", default: "" },
    unread: { type: "boolean", description: "Show only unread messages", default: false },
    from: { type: "string", description: "Filter by sender", default: "" },
    subject: { type: "string", description: "Filter by subject", default: "" },
    since: { type: "string", description: "Filter by date (ISO or natural)", default: "" },
    folder: { type: "string", description: "Folder name", default: "" },
    json: { type: "boolean", description: "Output as JSON", default: false },
  },
  async run({ args }) {
    const config = await loadConfig();
    await ensureConfigDir();
    const limit = args.limit ? parseInt(args.limit, 10) : config.defaultLimit;
    const folder = args.folder || config.defaultFolder;

    const executor = await createExecutor();
    const result = await executor.execute<MailMessage | MailMessage[]>("mail", "list-inbox", {
      limit,
      folder,
      filterUnread: args.unread,
      filterFrom: args.from,
      filterSubject: args.subject,
      filterSince: args.since,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    // Normalize: PS1 returns object (not array) when only 1 result
    const messages = Array.isArray(result.data)
      ? result.data
      : result.data
      ? [result.data]
      : [];

    await saveIdCache("mail", messages.map((m) => m.EntryID));
    formatMailList(messages, args.json);
  },
});

export default list;
