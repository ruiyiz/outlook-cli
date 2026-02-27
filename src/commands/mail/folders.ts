import { defineCommand } from "citty";
import { createExecutor } from "../../executor";
import { formatFolders } from "../../lib/formatter";
import type { MailFolder } from "../../types/mail";

const folders = defineCommand({
  meta: {
    name: "folders",
    description: "List mail folders",
  },
  args: {
    recursive: { type: "boolean", description: "Show subfolders recursively", default: false },
    json: { type: "boolean", description: "Output as JSON", default: false },
  },
  async run({ args }) {
    const executor = await createExecutor();
    const result = await executor.execute<MailFolder | MailFolder[]>("mail", "list-folders", {
      recursive: args.recursive,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    const foldersData = Array.isArray(result.data)
      ? result.data
      : result.data
      ? [result.data]
      : [];

    formatFolders(foldersData, args.json);
  },
});

export default folders;
