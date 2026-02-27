import { defineCommand } from "citty";

const mail = defineCommand({
  meta: {
    name: "mail",
    description: "Outlook mail commands",
  },
  subCommands: {
    list: () => import("./list").then((m) => m.default),
    read: () => import("./read").then((m) => m.default),
    send: () => import("./send").then((m) => m.default),
    move: () => import("./move").then((m) => m.default),
    delete: () => import("./delete").then((m) => m.default),
    mark: () => import("./mark").then((m) => m.default),
    folders: () => import("./folders").then((m) => m.default),
    attachment: () => import("./attachment").then((m) => m.default),
    search: () => import("./search").then((m) => m.default),
  },
});

export default mail;
