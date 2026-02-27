import { defineCommand } from "citty";
import { createExecutor } from "../../executor";

const create = defineCommand({
  meta: {
    name: "create",
    description: "Create a calendar event",
  },
  args: {
    subject: { type: "string", description: "Event subject", required: true },
    start: { type: "string", description: "Start datetime", required: true },
    end: { type: "string", description: "End datetime", required: true },
    location: { type: "string", description: "Location", default: "" },
    body: { type: "string", description: "Event body/notes", default: "" },
    attendees: { type: "string", description: "Attendee emails (semicolon-separated)", default: "" },
    "all-day": { type: "boolean", description: "All day event", default: false },
    json: { type: "boolean", description: "Output as JSON", default: false },
  },
  async run({ args }) {
    const executor = await createExecutor();
    const result = await executor.execute("calendar", "create-event", {
      subject: args.subject,
      start: args.start,
      end: args.end,
      location: args.location,
      body: args.body,
      attendees: args.attendees,
      allDay: args["all-day"],
    });

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    if (args.json) {
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      const r = result.data as { Subject: string; Start: string };
      console.log(`Event created: "${r.Subject}" at ${r.Start}`);
    }
  },
});

export default create;
