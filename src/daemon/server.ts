#!/usr/bin/env bun
import { BridgeExecutor } from "../executor/bridge-executor";
import { loadConfig, ensureConfigDir } from "../lib/config";
import { SOCKET_PATH, PID_PATH } from "./paths";
import { unlinkSync, writeFileSync } from "fs";

await ensureConfigDir();

// Remove stale socket from a previous run
try { unlinkSync(SOCKET_PATH); } catch {}

writeFileSync(PID_PATH, String(process.pid));

const config = await loadConfig();
const executor = new BridgeExecutor(config.powershellPath);

// Per-socket read buffers
const buffers = new WeakMap<object, string>();

const server = Bun.listen({
  unix: SOCKET_PATH,
  socket: {
    open(socket) {
      buffers.set(socket, "");
    },
    data(socket, chunk) {
      const text = (buffers.get(socket) ?? "") + new TextDecoder().decode(chunk);
      const nl = text.indexOf("\n");
      if (nl === -1) {
        buffers.set(socket, text);
        return;
      }
      buffers.delete(socket);

      let req: { category: string; name: string; params?: Record<string, unknown> };
      try {
        req = JSON.parse(text.slice(0, nl));
      } catch {
        socket.end(JSON.stringify({ success: false, error: "Invalid JSON request" }) + "\n");
        return;
      }

      executor
        .execute(req.category, req.name, req.params ?? {})
        .then((result) => socket.end(JSON.stringify(result) + "\n"))
        .catch((err) =>
          socket.end(JSON.stringify({ success: false, error: String(err) }) + "\n")
        );
    },
    close(socket) {
      buffers.delete(socket);
    },
    error(socket, err) {
      buffers.delete(socket);
      console.error("Socket error:", err);
    },
  },
});

function shutdown() {
  server.stop();
  try { unlinkSync(SOCKET_PATH); } catch {}
  try { unlinkSync(PID_PATH); } catch {}
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
