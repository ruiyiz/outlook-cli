import type { MailMessage } from "@cli/types/mail.ts";

export type ViewName = "inbox" | "calendar";

export interface AppState {
  view: ViewName;
  cursorIndex: number;
  cursorMemory: Partial<Record<ViewName, number>>;
  scrollOffset: number;
  scrollMemory: Partial<Record<ViewName, number>>;
  readingEntryId: string | null;
  readingScrollOffset: number;
  readingThreadMessages: MailMessage[];
}

export type Action =
  | { type: "SWITCH_VIEW" }
  | { type: "SET_CURSOR"; index: number }
  | { type: "SET_SCROLL"; offset: number }
  | { type: "SET_CURSOR_AND_SCROLL"; index: number; offset: number }
  | { type: "OPEN_READING"; entryId: string; threadMessages: MailMessage[] }
  | { type: "CLOSE_READING" }
  | { type: "SET_READING_SCROLL"; offset: number };

export const initialState: AppState = {
  view: "inbox",
  cursorIndex: 0,
  cursorMemory: {},
  scrollOffset: 0,
  scrollMemory: {},
  readingEntryId: null,
  readingScrollOffset: 0,
  readingThreadMessages: [],
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SWITCH_VIEW": {
      const next: ViewName = state.view === "inbox" ? "calendar" : "inbox";
      const mem = { ...state.cursorMemory, [state.view]: state.cursorIndex };
      const smem = { ...state.scrollMemory, [state.view]: state.scrollOffset };
      return {
        ...state,
        view: next,
        cursorIndex: mem[next] ?? 0,
        cursorMemory: mem,
        scrollOffset: smem[next] ?? 0,
        scrollMemory: smem,
      };
    }
    case "SET_CURSOR":
      return { ...state, cursorIndex: action.index };
    case "SET_SCROLL":
      return { ...state, scrollOffset: action.offset };
    case "SET_CURSOR_AND_SCROLL":
      return { ...state, cursorIndex: action.index, scrollOffset: action.offset };
    case "OPEN_READING":
      return {
        ...state,
        readingEntryId: action.entryId,
        readingScrollOffset: 0,
        readingThreadMessages: action.threadMessages,
      };
    case "CLOSE_READING":
      return { ...state, readingEntryId: null, readingScrollOffset: 0, readingThreadMessages: [] };
    case "SET_READING_SCROLL":
      return { ...state, readingScrollOffset: action.offset };
    default:
      return state;
  }
}
