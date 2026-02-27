export interface CalendarEvent {
  EntryID: string;
  Subject: string;
  Start: string;
  End: string;
  Location?: string;
  Body?: string;
  Organizer?: string;
  RequiredAttendees?: string;
  OptionalAttendees?: string;
  IsAllDayEvent: boolean;
  BusyStatus: number;
  ReminderMinutesBeforeStart: number;
  Duration: number;
}

export interface CreateEventParams {
  subject: string;
  start: string;
  end: string;
  location?: string;
  body?: string;
  attendees?: string;
  allDay?: boolean;
}

export interface UpdateEventParams {
  entryId: string;
  subject?: string;
  start?: string;
  end?: string;
  location?: string;
  body?: string;
  attendees?: string;
}
