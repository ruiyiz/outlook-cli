export type ViewName = "inbox" | "calendar";

export interface AppState {
  view: ViewName;
  cursorIndex: number;
  cursorMemory: Partial<Record<ViewName, number>>;
  scrollOffset: number;
  scrollMemory: Partial<Record<ViewName, number>>;
}

export type Action =
  | { type: "SWITCH_VIEW" }
  | { type: "SET_CURSOR"; index: number }
  | { type: "SET_SCROLL"; offset: number };

export const initialState: AppState = {
  view: "inbox",
  cursorIndex: 0,
  cursorMemory: {},
  scrollOffset: 0,
  scrollMemory: {},
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
    default:
      return state;
  }
}
