import { defineCommand } from "citty";
import { createExecutor } from "../../executor";
import { resolveId } from "../../lib/id-cache";

const move = defineCommand({
  meta: {
    name: "move",
    description: "Move a message to a folder",
  },
  args: {
    id: { type: "positional", description: "Message index or EntryID", required: true },
    to: { type: "string", description: "Target folder name", required: true },
    json: { type: "boolean", description: "Output as JSON", default: false },
  },
  async run({ args }) {
    const entryId = await resolveId("mail", args.id);
    const executor = await createExecutor();
    const result = await executor.execute("mail", "move-message", {
      entryId,
      targetFolder: args.to,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (args.json) {
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.log(`Message moved to ${args.to}`);
    }
  },
});

export default move;
