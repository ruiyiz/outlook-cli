import type { IOutlookExecutor } from "./interface";
import type { ExecutorResult } from "../types/executor";
import { loadScript } from "../lib/script-loader";
import { withRetry } from "../lib/retry";
import { LineReader } from "./line-reader";
import { join } from "path";

interface BridgeResponse {
  ok: boolean;
  out: string;
  err: string;
}

export class BridgeExecutor implements IOutlookExecutor {
  private psPath: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private proc: any = null;
  private reader: LineReader | null = null;
  private pending: Promise<void> = Promise.resolve();

  constructor(psPath = "powershell.exe") {
    this.psPath = psPath;
    process.on("exit", () => this.cleanup());
  }

  private async start(): Promise<void> {
    const bridgePath = join(import.meta.dir, "..", "scripts", "bridge.ps1");
    const bridgeScript = await Bun.file(bridgePath).text();

    this.proc = Bun.spawn(
      [this.psPath, "-NoProfile", "-NonInteractive", "-Command", bridgeScript],
      { stdin: "pipe", stdout: "pipe", stderr: "pipe" }
    );

    this.reader = new LineReader(this.proc.stdout);

    const readyLine = await this.reader.readLine();
    if (readyLine?.trim() !== "READY") {
      this.proc.kill();
      this.proc = null;
      this.reader = null;
      throw new Error(`Bridge failed to start (expected READY, got: ${JSON.stringify(readyLine)})`);
    }

    this.proc.exited.then(() => {
      this.proc = null;
      this.reader = null;
    });
  }

  private async ensureRunning(): Promise<void> {
    if (!this.proc) {
      await this.start();
    }
  }

  private cleanup(): void {
    if (this.proc) {
      this.proc.kill();
      this.proc = null;
      this.reader = null;
    }
  }

  private runScript<T>(script: string): Promise<ExecutorResult<T>> {
    return new Promise<ExecutorResult<T>>((resolve, reject) => {
      this.pending = this.pending.then(async () => {
        try {
          await this.ensureRunning();
          const proc = this.proc!;
          const reader = this.reader!;

          const encoded = Buffer.from(script, "utf-8").toString("base64");
          proc.stdin.write(encoded + "\n");
          await proc.stdin.flush();

          const line = await reader.readLine();
          if (line === null) {
            throw new Error("Bridge process closed unexpectedly");
          }

          const response = JSON.parse(line) as BridgeResponse;
          const { out, err } = response;

          // COM busy - throw so withRetry can retry
          if (err.includes("0x80010001") || err.includes("RPC_E_CALL_REJECTED")) {
            throw new Error(err);
          }

          // Outlook not running
          if (
            err.includes("0x80080005") ||
            err.includes("CO_E_SERVER_EXEC_FAILURE") ||
            (err.includes("Outlook.Application") && err.includes("failed"))
          ) {
            resolve({
              success: false,
              error: "Outlook is not running. Please start Outlook and try again.",
            });
            return;
          }

          if (!response.ok) {
            resolve({ success: false, error: err || "Bridge execution failed" });
            return;
          }

          if (!out) {
            if (err) {
              resolve({ success: false, error: err });
              return;
            }
            resolve({ success: true, data: undefined as T });
            return;
          }

          try {
            const data = JSON.parse(out) as T;
            resolve({ success: true, data });
          } catch {
            resolve({
              success: false,
              error: `Failed to parse JSON output: ${out.slice(0, 200)}`,
            });
          }
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  async execute<T>(
    scriptCategory: string,
    scriptName: string,
    params: Record<string, unknown> = {}
  ): Promise<ExecutorResult<T>> {
    const script = await loadScript(scriptCategory, scriptName, params);
    return withRetry(() => this.runScript<T>(script));
  }
}
