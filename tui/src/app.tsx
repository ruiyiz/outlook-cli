import React, { useReducer } from "react";
import { Box, useApp, useInput, useStdout } from "ink";
import { AppContext } from "./context.ts";
import { reducer, initialState } from "./state.ts";
import { Header } from "./components/header.tsx";
import { Footer } from "./components/footer.tsx";
import { InboxView } from "./views/inbox-view.tsx";
import { CalendarView } from "./views/calendar-view.tsx";
import { useInbox } from "./hooks/use-inbox.ts";
import { useCalendar } from "./hooks/use-calendar.ts";

export function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [state, dispatch] = useReducer(reducer, initialState);
  const inbox = useInbox();
  const calendar = useCalendar();

  const unreadCount = inbox.messages.filter((m) => m.Unread).length;

  useInput((input, key) => {
    if (input === "q" && key.ctrl) {
      exit();
      return;
    }
    if (key.tab) {
      dispatch({ type: "SWITCH_VIEW" });
      return;
    }
    if (input === "r") {
      if (state.view === "inbox") inbox.refresh();
      else calendar.refresh();
      return;
    }
  });

  const currentLoading = state.view === "inbox" ? inbox.loading : calendar.loading;
  const currentLastRefresh = state.view === "inbox" ? inbox.lastRefresh : calendar.lastRefresh;

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Box flexDirection="column" height={stdout.rows}>
        <Header unreadCount={unreadCount} loading={currentLoading} />
        <Box flexDirection="column" flexGrow={1} overflow="hidden">
          {state.view === "inbox" ? (
            <InboxView {...inbox} />
          ) : (
            <CalendarView {...calendar} />
          )}
        </Box>
        <Footer view={state.view} lastRefresh={currentLastRefresh} loading={currentLoading} />
      </Box>
    </AppContext.Provider>
  );
}
