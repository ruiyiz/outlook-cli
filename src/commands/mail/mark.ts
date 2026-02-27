import { defineCommand } from "citty";
import { createExecutor } from "../../executor";
import { resolveId } from "../../lib/id-cache";

const mark = defineCommand({
  meta: {
    name: "mark",
    description: "Mark a message as read or unread",
  },
  args: {
    id: { type: "positional", description: "Message index or EntryID", required: true },
    read: { type: "boolean", description: "Mark as read", default: false },
    unread: { type: "boolean", description: "Mark as unread", default: false },
    json: { type: "boolean", description: "Output as JSON", default: false },
  },
  async run({ args }) {
    if (!args.read && !args.unread) {
      console.error("Error: specify --read or --unread");
      process.exit(1);
    }

    const entryId = await resolveId("mail", args.id);
    const executor = await createExecutor();
    const result = await executor.execute("mail", "mark-read", {
      entryId,
      markAsRead: args.read,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (args.json) {
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.log(`Message marked as ${args.read ? "read" : "unread"}.`);
    }
  },
});

export default mark;
