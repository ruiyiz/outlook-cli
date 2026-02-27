import { defineCommand } from "citty";
import { createExecutor } from "../../executor";

interface CalendarFolder {
  Name: string;
  Store: string;
  FolderPath: string;
}

const calendars = defineCommand({
  meta: {
    name: "calendars",
    description: "List all available calendars",
  },
  args: {
    json: { type: "boolean", description: "Output as JSON", default: false },
  },
  async run({ args }) {
    const executor = await createExecutor();
    const result = await executor.execute<CalendarFolder | CalendarFolder[]>(
      "calendar",
      "list-calendars",
      {}
    );

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    const folders = Array.isArray(result.data)
      ? result.data
      : result.data
      ? [result.data]
      : [];

    if (args.json) {
      console.log(JSON.stringify(folders, null, 2));
      return;
    }

    for (const f of folders) {
      console.log(`${f.Name.padEnd(30)} ${f.FolderPath}`);
    }
  },
});

export default calendars;
