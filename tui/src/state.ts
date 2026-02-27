export type ViewName = "inbox" | "calendar";

export interface AppState {
  view: ViewName;
  cursorIndex: number;
  cursorMemory: Partial<Record<ViewName, number>>;
}

export type Action =
  | { type: "SWITCH_VIEW" }
  | { type: "SET_CURSOR"; index: number };

export const initialState: AppState = {
  view: "inbox",
  cursorIndex: 0,
  cursorMemory: {},
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SWITCH_VIEW": {
      const next: ViewName = state.view === "inbox" ? "calendar" : "inbox";
      const mem = { ...state.cursorMemory, [state.view]: state.cursorIndex };
      return { ...state, view: next, cursorIndex: mem[next] ?? 0, cursorMemory: mem };
    }
    case "SET_CURSOR":
      return { ...state, cursorIndex: action.index };
    default:
      return state;
  }
}
