#!/usr/bin/env bun
import React from "react";
import { render } from "ink";
import { App } from "./app.tsx";

const enterAltScreen = "\x1b[?1049h";
const leaveAltScreen = "\x1b[?1049l";

process.stdout.write(enterAltScreen + "\x1b[H\x1b[2J");

// Find the most recently modified source file as the "build" timestamp
const srcDir = import.meta.dir;
let lastModified = new Date(0);
for (const path of new Bun.Glob("**/*.{ts,tsx}").scanSync(srcDir)) {
  const mtime = Bun.file(`${srcDir}/${path}`).lastModified;
  if (mtime > lastModified.getTime()) lastModified = new Date(mtime);
}

const { waitUntilExit } = render(<App lastModified={lastModified} />, { exitOnCtrlC: false });

waitUntilExit().then(() => {
  process.stdout.write(leaveAltScreen);
});
