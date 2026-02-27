import type { IOutlookExecutor } from "./interface";
import type { ExecutorResult } from "../types/executor";
import { SOCKET_PATH, LOG_PATH } from "../daemon/paths";
import { ensureConfigDir } from "../lib/config";
import { existsSync, openSync, closeSync } from "fs";
import { dirname, join } from "path";

export class DaemonExecutor implements IOutlookExecutor {
  private send<T>(
    category: string,
    name: string,
    params: Record<string, unknown>
  ): Promise<ExecutorResult<T>> {
    const request = JSON.stringify({ category, name, params }) + "\n";
    return new Promise<ExecutorResult<T>>((resolve, reject) => {
      let buf = "";
      Bun.connect({
        unix: SOCKET_PATH,
        socket: {
          open(socket) {
            socket.write(request);
          },
          data(_, chunk) {
            buf += new TextDecoder().decode(chunk);
            const nl = buf.indexOf("\n");
            if (nl === -1) return;
            try {
              resolve(JSON.parse(buf.slice(0, nl)) as ExecutorResult<T>);
            } catch (e) {
              reject(e);
            }
          },
          error(_, err) {
            reject(err);
          },
          close() {
            if (!buf.includes("\n")) {
              reject(new Error("Daemon closed connection without sending a response"));
            }
          },
        },
      }).catch(reject);
    });
  }

  private getDaemonArgs(): string[] {
    // When installed globally, outlook-daemon is a sibling of the outlook binary
    const sibling = join(dirname(process.argv[1] ?? ""), "outlook-daemon");
    if (existsSync(sibling)) return [sibling];
    // Development fallback: run the server script directly with bun
    return ["bun", join(import.meta.dir, "..", "daemon", "server.ts")];
  }

  private async startDaemon(): Promise<void> {
    await ensureConfigDir();
    const fd = openSync(LOG_PATH, "a");
    const proc = Bun.spawn(this.getDaemonArgs(), {
      stdin: "ignore",
      stdout: fd,
      stderr: fd,
    });
    closeSync(fd);
    proc.unref();
  }

  private async waitForSocket(timeoutMs = 5000): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      await Bun.sleep(100);
      try {
        await new Promise<void>((resolve, reject) => {
          Bun.connect({
            unix: SOCKET_PATH,
            socket: {
              open(socket) { socket.end(); resolve(); },
              error(_, err) { reject(err); },
            },
          }).catch(reject);
        });
        return;
      } catch {
        // not ready yet
      }
    }
    throw new Error("Daemon failed to start within 5 seconds");
  }

  async execute<T>(
    scriptCategory: string,
    scriptName: string,
    params: Record<string, unknown> = {}
  ): Promise<ExecutorResult<T>> {
    try {
      return await this.send<T>(scriptCategory, scriptName, params);
    } catch {
      await this.startDaemon();
      await this.waitForSocket();
      return await this.send<T>(scriptCategory, scriptName, params);
    }
  }
}
