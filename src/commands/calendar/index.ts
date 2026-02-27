import { defineCommand } from "citty";

const calendar = defineCommand({
  meta: {
    name: "calendar",
    description: "Outlook calendar commands",
  },
  subCommands: {
    list: () => import("./list").then((m) => m.default),
    show: () => import("./show").then((m) => m.default),
    create: () => import("./create").then((m) => m.default),
    update: () => import("./update").then((m) => m.default),
    delete: () => import("./delete").then((m) => m.default),
  },
});

export default calendar;
