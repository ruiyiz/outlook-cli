import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "outlook",
    version: "0.1.0",
    description: "CLI for Outlook Classic via COM from WSL2",
  },
  subCommands: {
    mail: () => import("./commands/mail/index").then((m) => m.default),
    calendar: () => import("./commands/calendar/index").then((m) => m.default),
  },
});

export default main;
