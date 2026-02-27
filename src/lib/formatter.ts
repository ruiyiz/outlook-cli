import { Table } from "console-table-printer";
import type { MailMessage, MailFolder } from "../types/mail";
import type { CalendarEvent } from "../types/calendar";
import { formatDate, formatShortDate } from "./date-utils";

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function formatMailList(messages: MailMessage[], json: boolean): void {
  if (json) {
    printJson(messages);
    return;
  }

  if (messages.length === 0) {
    console.log("No messages found.");
    return;
  }

  const t = new Table({
    columns: [
      { name: "#", alignment: "right", maxLen: 4 },
      { name: "From", alignment: "left", maxLen: 22 },
      { name: "Subject", alignment: "left", maxLen: 50 },
      { name: "Date", alignment: "left", maxLen: 20 },
      { name: "U", alignment: "center", maxLen: 1 },
      { name: "A", alignment: "center", maxLen: 1 },
    ],
  });

  messages.forEach((msg, i) => {
    t.addRow({
      "#": i + 1,
      "From": truncate(msg.SenderName || msg.SenderEmailAddress, 22),
      "Subject": truncate(msg.Subject, 50),
      "Date": truncate(formatDate(msg.ReceivedTime), 20),
      "U": msg.Unread ? "*" : "",
      "A": msg.HasAttachments ? "@" : "",
    });
  });

  t.printTable();
}

export function formatMailDetail(msg: MailMessage, json: boolean): void {
  if (json) {
    printJson(msg);
    return;
  }

  console.log(`From:    ${msg.SenderName} <${msg.SenderEmailAddress}>`);
  console.log(`To:      ${msg.To || ""}`);
  if (msg.CC) console.log(`CC:      ${msg.CC}`);
  console.log(`Date:    ${formatDate(msg.ReceivedTime)}`);
  console.log(`Subject: ${msg.Subject}`);
  if (msg.HasAttachments) {
    const atts = msg.Attachments?.map((a) => a.FileName).join(", ") || "";
    console.log(`Attachments (${msg.AttachmentCount}): ${atts}`);
  }
  console.log("─".repeat(72));
  console.log(msg.Body || "");
}

export function formatFolders(folders: MailFolder[], json: boolean, indent = 0): void {
  if (json) {
    printJson(folders);
    return;
  }

  for (const f of folders) {
    const prefix = "  ".repeat(indent);
    const unread = f.UnreadItemCount > 0 ? ` (${f.UnreadItemCount} unread)` : "";
    console.log(`${prefix}${f.Name}${unread} [${f.ItemCount}]`);
    if (f.Folders && f.Folders.length > 0) {
      formatFolders(f.Folders, false, indent + 1);
    }
  }
}

export function formatCalendarList(events: CalendarEvent[], json: boolean): void {
  if (json) {
    printJson(events);
    return;
  }

  if (events.length === 0) {
    console.log("No events found.");
    return;
  }

  const t = new Table({
    columns: [
      { name: "#", alignment: "right", maxLen: 4 },
      { name: "Subject", alignment: "left", maxLen: 40 },
      { name: "Start", alignment: "left", maxLen: 20 },
      { name: "End", alignment: "left", maxLen: 20 },
      { name: "Location", alignment: "left", maxLen: 20 },
    ],
  });

  events.forEach((e, i) => {
    t.addRow({
      "#": i + 1,
      "Subject": truncate(e.Subject, 40),
      "Start": truncate(formatDate(e.Start), 20),
      "End": truncate(formatDate(e.End), 20),
      "Location": truncate(e.Location || "", 20),
    });
  });

  t.printTable();
}

export function formatCalendarDetail(event: CalendarEvent, json: boolean): void {
  if (json) {
    printJson(event);
    return;
  }

  console.log(`Subject:   ${event.Subject}`);
  console.log(`Start:     ${formatDate(event.Start)}`);
  console.log(`End:       ${formatDate(event.End)}`);
  if (event.Location) console.log(`Location:  ${event.Location}`);
  if (event.Organizer) console.log(`Organizer: ${event.Organizer}`);
  if (event.RequiredAttendees) console.log(`Attendees: ${event.RequiredAttendees}`);
  console.log(`Duration:  ${event.Duration} min`);
  if (event.Body) {
    console.log("─".repeat(72));
    console.log(event.Body);
  }
}
