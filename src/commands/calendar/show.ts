import { defineCommand } from "citty";
import { createExecutor } from "../../executor";
import { formatCalendarDetail } from "../../lib/formatter";
import { resolveId } from "../../lib/id-cache";
import type { CalendarEvent } from "../../types/calendar";

const show = defineCommand({
  meta: {
    name: "show",
    description: "Show a calendar event",
  },
  args: {
    id: { type: "positional", description: "Event index or EntryID", required: true },
    calendar: { type: "string", description: "Calendar name (default: primary calendar)", default: "" },
    json: { type: "boolean", description: "Output as JSON", default: false },
  },
  async run({ args }) {
    const entryId = await resolveId("calendar", args.id);

    const executor = await createExecutor();

    // Get a wide range to find the event
    const wideFrom = new Date();
    wideFrom.setFullYear(wideFrom.getFullYear() - 1);
    const wideTo = new Date();
    wideTo.setFullYear(wideTo.getFullYear() + 1);

    const result = await executor.execute<CalendarEvent | CalendarEvent[]>(
      "calendar",
      "list-events",
      {
        fromDate: wideFrom.toISOString(),
        toDate: wideTo.toISOString(),
        calendarName: args.calendar,
      }
    );

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    const events = Array.isArray(result.data)
      ? result.data
      : result.data
      ? [result.data]
      : [];

    const event = events.find((e) => e.EntryID === entryId);
    if (!event) {
      console.error("Event not found.");
      process.exit(1);
    }

    formatCalendarDetail(event, args.json);
  },
});

export default show;
