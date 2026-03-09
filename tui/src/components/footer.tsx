import React from "react";
import { Box, Text } from "ink";
import type { ViewName } from "../state.ts";
import { theme } from "../theme.ts";

interface Props {
  view: ViewName;
  lastRefresh: Date | null;
  loading: boolean;
  lastModified: Date;
}

function h(key: string, desc: string) {
  return { key, desc };
}

export function Footer({ view, lastRefresh, loading, lastModified }: Props) {
  const tabDest = view === "inbox" ? "calendar" : "inbox";
  const hints = [
    h("j/k", "move"),
    h("Tab", tabDest),
    h("r", "refresh"),
    h("^Q", "quit"),
  ];

  const refreshStr = loading
    ? "syncing…"
    : lastRefresh
    ? `↻ ${lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "";

  const buildStr = `src ${lastModified.toLocaleString([], { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;

  return (
    <Box
      borderStyle="single"
      borderTop={true}
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      paddingX={1}
    >
      {hints.map((hint, i) => (
        <Box key={hint.key + hint.desc} marginRight={2}>
          <Text bold color={theme.selection}>{hint.key}</Text>
          <Text dimColor> {hint.desc}</Text>
        </Box>
      ))}
      <Box flexGrow={1} justifyContent="flex-end" gap={2}>
        {refreshStr && <Text dimColor>{refreshStr}</Text>}
        <Text dimColor>{buildStr}</Text>
      </Box>
    </Box>
  );
}
