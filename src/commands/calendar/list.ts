import { defineCommand } from "citty";
import { createExecutor } from "../../executor";
import { formatCalendarList } from "../../lib/formatter";
import { saveIdCache } from "../../lib/id-cache";
import { today, thisWeek, parseDate } from "../../lib/date-utils";
import type { CalendarEvent } from "../../types/calendar";

const list = defineCommand({
  meta: {
    name: "list",
    description: "List calendar events",
  },
  args: {
    today: { type: "boolean", description: "Show today's events", default: false },
    week: { type: "boolean", description: "Show this week's events", default: false },
    from: { type: "string", description: "Start date", default: "" },
    to: { type: "string", description: "End date", default: "" },
    json: { type: "boolean", description: "Output as JSON", default: false },
  },
  async run({ args }) {
    let fromDate: string;
    let toDate: string;

    if (args.today) {
      ({ from: fromDate, to: toDate } = today());
    } else if (args.week) {
      ({ from: fromDate, to: toDate } = thisWeek());
    } else if (args.from || args.to) {
      fromDate = args.from ? parseDate(args.from) : today().from;
      toDate = args.to ? parseDate(args.to) : thisWeek().to;
    } else {
      // Default: today
      ({ from: fromDate, to: toDate } = today());
    }

    const executor = await createExecutor();
    const result = await executor.execute<CalendarEvent | CalendarEvent[]>(
      "calendar",
      "list-events",
      { fromDate, toDate }
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

    await saveIdCache("calendar", events.map((e) => e.EntryID));
    formatCalendarList(events, args.json);
  },
});

export default list;
