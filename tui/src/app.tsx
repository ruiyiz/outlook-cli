import React, { useEffect, useReducer, useRef, useState } from "react";
import { Box, useApp, useInput, useStdout } from "ink";
import { AppContext } from "./context.ts";
import { reducer, initialState } from "./state.ts";
import { Header } from "./components/header.tsx";
import { HelpOverlay } from "./components/help-overlay.tsx";
import { InboxView } from "./views/inbox-view.tsx";
import { FlaggedView } from "./views/flagged-view.tsx";
import { CalendarView } from "./views/calendar-view.tsx";
import { ReadingView } from "./views/reading-view.tsx";
import { useInbox } from "./hooks/use-inbox.ts";
import { useFlagged } from "./hooks/use-flagged.ts";
import { useCalendar } from "./hooks/use-calendar.ts";

export function App({ lastModified }: { lastModified: Date }) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showHelp, setShowHelp] = useState(false);
  const inbox = useInbox();
  const flagged = useFlagged();
  const flaggedLoadedRef = useRef(false);
  const calendar = useCalendar();

  useEffect(() => {
    if (state.view === "flagged" && !flaggedLoadedRef.current) {
      flaggedLoadedRef.current = true;
      flagged.refresh();
    }
  }, [state.view]);

  const isReading = state.readingEntryId !== null && (state.view === "inbox" || state.view === "flagged");
  const unreadCount = inbox.messages.filter((m) => m.Unread).length;
  const flaggedCount = flagged.flaggedThreads.length;

  useInput((input, key) => {
    if (input === "q" && key.ctrl) {
      exit();
      return;
    }
    if (input === "?") {
      setShowHelp((v) => !v);
      return;
    }
    if (showHelp) return;
    if (isReading) return;
    if (key.tab) {
      dispatch({ type: "SWITCH_VIEW" });
      return;
    }
    if (input === "1") { dispatch({ type: "SWITCH_TO_VIEW", view: "inbox" }); return; }
    if (input === "2") { dispatch({ type: "SWITCH_TO_VIEW", view: "flagged" }); return; }
    if (input === "3") { dispatch({ type: "SWITCH_TO_VIEW", view: "calendar" }); return; }
    if (input === "r") {
      if (state.view === "flagged") flagged.refresh();
      else if (state.view === "inbox") inbox.refresh();
      else calendar.refresh();
      return;
    }
  });

  const currentLoading = state.view === "calendar" ? calendar.loading : state.view === "flagged" ? flagged.loading : inbox.loading;
  const currentLastRefresh = state.view === "calendar" ? calendar.lastRefresh : state.view === "flagged" ? flagged.lastRefresh : inbox.lastRefresh;
  // header: borderTop(1) + content(1) + borderBottom(1) = 3
  // -1 extra to keep total output < stdout.rows, avoiding Ink's clearTerminal path (which flickers)
  const viewportHeight = Math.max(1, (stdout.rows ?? 24) - 4);

  function handleCloseReading() {
    dispatch({ type: "CLOSE_READING" });
    inbox.refresh();
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Box flexDirection="column" height={Math.max(1, (stdout.rows ?? 24) - 1)}>
        <Header
          unreadCount={unreadCount}
          flaggedCount={flaggedCount}
          loading={currentLoading}
          lastRefresh={currentLastRefresh}
        />
        {showHelp ? (
          <HelpOverlay onClose={() => setShowHelp(false)} />
        ) : (
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
            <Box flexDirection="column" flexGrow={1} display={isReading || state.view !== "flagged" ? "none" : "flex"}>
              <FlaggedView flaggedThreads={flagged.flaggedThreads} loading={flagged.loading} error={flagged.error} viewportHeight={viewportHeight} isActive={!isReading && state.view === "flagged"} />
            </Box>
            <Box flexDirection="column" flexGrow={1} display={isReading || state.view !== "calendar" ? "none" : "flex"}>
              <CalendarView {...calendar} viewportHeight={viewportHeight} isActive={!isReading && state.view === "calendar"} />
            </Box>
          </Box>
        )}
      </Box>
    </AppContext.Provider>
  );
}
