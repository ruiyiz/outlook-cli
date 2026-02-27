import { defineCommand } from "citty";
import { createExecutor } from "../../executor";
import { formatMailList } from "../../lib/formatter";
import { saveIdCache } from "../../lib/id-cache";
import { loadConfig } from "../../lib/config";
import type { MailMessage } from "../../types/mail";

const search = defineCommand({
  meta: {
    name: "search",
    description: "Search mail messages",
  },
  args: {
    query: { type: "positional", description: "Search query", required: true },
    limit: { type: "string", description: "Number of results", default: "" },
    json: { type: "boolean", description: "Output as JSON", default: false },
  },
  async run({ args }) {
    const config = await loadConfig();
    const limit = args.limit ? parseInt(args.limit, 10) : config.defaultLimit;

    const executor = await createExecutor();
    const result = await executor.execute<MailMessage | MailMessage[]>("mail", "search-mail", {
      query: args.query,
      limit,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    const messages = Array.isArray(result.data)
      ? result.data
      : result.data
      ? [result.data]
      : [];

    await saveIdCache("mail", messages.map((m) => m.EntryID));
    formatMailList(messages, args.json);
  },
});

export default search;
