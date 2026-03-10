import React from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../theme.ts";

interface Props {
  onClose: () => void;
}

interface Section {
  title: string;
  color: string;
  keys: [string, string][];
}

const sections: Section[] = [
  {
    title: "Global",
    color: "magenta",
    keys: [
      ["Ctrl+Q", "Quit"],
      ["?", "Toggle help"],
      ["r", "Refresh"],
      ["Tab / 1/2/3", "Switch tabs"],
    ],
  },
  {
    title: "Navigation",
    color: "blue",
    keys: [
      ["j / ↓", "Move cursor down"],
      ["k / ↑", "Move cursor up"],
      ["PgDn / PgUp", "Page scroll"],
      ["Enter", "Open / expand thread"],
    ],
  },
  {
    title: "Reading",
    color: "green",
    keys: [
      ["j / ↓", "Scroll down"],
      ["k / ↑", "Scroll up"],
      ["PgDn / PgUp", "Page scroll"],
      ["Esc / q", "Close"],
    ],
  },
];

export function HelpOverlay({ onClose }: Props) {
  useInput((input, key) => {
    if (input === "?" || key.escape) onClose();
  });

  return (
    <Box flexDirection="column" borderStyle="single" borderColor={theme.accent} paddingX={2} paddingY={1}>
      <Text bold color={theme.accent}>Keyboard Shortcuts</Text>
      <Text> </Text>
      {sections.map((section) => (
        <Box key={section.title} flexDirection="column" marginBottom={1}>
          <Text bold color={section.color as any}>{section.title}</Text>
          {section.keys.map(([k, desc]) => (
            <Box key={k}>
              <Text>  </Text>
              <Text bold color={theme.selection}>{k.padEnd(16)}</Text>
              <Text dimColor>{desc}</Text>
            </Box>
          ))}
        </Box>
      ))}
      <Box>
        <Text bold color={theme.selection}>?</Text>
        <Text dimColor> or </Text>
        <Text bold color={theme.selection}>Esc</Text>
        <Text dimColor> to close</Text>
      </Box>
    </Box>
  );
}
