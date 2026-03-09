import React, { useReducer } from "react";
import { Box, useApp, useInput, useStdout } from "ink";
import { AppContext } from "./context.ts";
import { reducer, initialState } from "./state.ts";
import { Header } from "./components/header.tsx";
import { Footer } from "./components/footer.tsx";
import { InboxView } from "./views/inbox-view.tsx";
import { CalendarView } from "./views/calendar-view.tsx";
import { ReadingView } from "./views/reading-view.tsx";
import { useInbox } from "./hooks/use-inbox.ts";
import { useCalendar } from "./hooks/use-calendar.ts";

export function App({ lastModified }: { lastModified: Date }) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [state, dispatch] = useReducer(reducer, initialState);
  const inbox = useInbox();
  const calendar = useCalendar();

  const isReading = state.readingEntryId !== null && state.view === "inbox";
  const unreadCount = inbox.messages.filter((m) => m.Unread).length;

  useInput((input, key) => {
    if (input === "q" && key.ctrl) {
      exit();
      return;
    }
    if (isReading) return;
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
  // header: borderTop(1) + content(1) + borderBottom(1) = 3
  // footer: borderTop(1) + content(1) = 2
  const viewportHeight = Math.max(1, (stdout.rows ?? 24) - 5);

  function handleCloseReading() {
    dispatch({ type: "CLOSE_READING" });
    inbox.refresh();
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Box flexDirection="column" height={stdout.rows}>
        <Header unreadCount={unreadCount} loading={currentLoading} />
        <Box flexDirection="column" flexGrow={1} overflow="hidden">
          {isReading && (
            <ReadingView
              entryId={state.readingEntryId!}
              threadMessages={state.readingThreadMessages}
              viewportHeight={viewportHeight}
              onClose={handleCloseReading}
            />
          )}
          <Box flexDirection="column" flexGrow={1} display={isReading || state.view !== "inbox" ? "none" : "flex"}>
            <InboxView threads={inbox.threads} loading={inbox.loading} error={inbox.error} viewportHeight={viewportHeight} isActive={!isReading && state.view === "inbox"} />
          </Box>
          <Box flexDirection="column" flexGrow={1} display={isReading || state.view !== "calendar" ? "none" : "flex"}>
            <CalendarView {...calendar} viewportHeight={viewportHeight} isActive={!isReading && state.view === "calendar"} />
          </Box>
        </Box>
        <Footer view={state.view} lastRefresh={currentLastRefresh} loading={currentLoading} lastModified={lastModified} isReading={isReading} />
      </Box>
    </AppContext.Provider>
  );
}
