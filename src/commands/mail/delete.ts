import { defineCommand } from "citty";
import { createExecutor } from "../../executor";
import { resolveId } from "../../lib/id-cache";

const del = defineCommand({
  meta: {
    name: "delete",
    description: "Delete a message",
  },
  args: {
    id: { type: "positional", description: "Message index or EntryID", required: true },
    permanent: { type: "boolean", description: "Delete permanently (skip Deleted Items)", default: false },
    json: { type: "boolean", description: "Output as JSON", default: false },
  },
  async run({ args }) {
    const entryId = await resolveId("mail", args.id);
    const executor = await createExecutor();
    const result = await executor.execute("mail", "delete-message", {
      entryId,
      permanent: args.permanent,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (args.json) {
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.log(args.permanent ? "Message permanently deleted." : "Message moved to Deleted Items.");
    }
  },
});

export default del;
