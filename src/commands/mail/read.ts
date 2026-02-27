import { defineCommand } from "citty";
import { createExecutor } from "../../executor";
import { formatMailDetail } from "../../lib/formatter";
import { resolveId } from "../../lib/id-cache";
import type { MailMessage } from "../../types/mail";

const read = defineCommand({
  meta: {
    name: "read",
    description: "Read a mail message",
  },
  args: {
    id: { type: "positional", description: "Message index or EntryID", required: true },
    json: { type: "boolean", description: "Output as JSON", default: false },
  },
  async run({ args }) {
    const entryId = await resolveId("mail", args.id);
    const executor = await createExecutor();
    const result = await executor.execute<MailMessage>("mail", "read-message", { entryId });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    formatMailDetail(result.data!, args.json);
  },
});

export default read;
