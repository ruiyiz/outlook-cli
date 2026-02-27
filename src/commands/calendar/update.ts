import { defineCommand } from "citty";
import { createExecutor } from "../../executor";
import { resolveId } from "../../lib/id-cache";

const update = defineCommand({
  meta: {
    name: "update",
    description: "Update a calendar event",
  },
  args: {
    id: { type: "positional", description: "Event index or EntryID", required: true },
    subject: { type: "string", description: "New subject", default: "" },
    start: { type: "string", description: "New start datetime", default: "" },
    end: { type: "string", description: "New end datetime", default: "" },
    location: { type: "string", description: "New location", default: "" },
    body: { type: "string", description: "New body", default: "" },
    attendees: { type: "string", description: "New attendees", default: "" },
    json: { type: "boolean", description: "Output as JSON", default: false },
  },
  async run({ args }) {
    const entryId = await resolveId("calendar", args.id);
    const executor = await createExecutor();
    const result = await executor.execute("calendar", "update-event", {
      entryId,
      subject: args.subject,
      start: args.start,
      end: args.end,
      location: args.location,
      body: args.body,
      attendees: args.attendees,
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (args.json) {
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.log("Event updated.");
    }
  },
});

export default update;
