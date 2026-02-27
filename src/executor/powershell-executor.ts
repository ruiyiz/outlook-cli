import type { IOutlookExecutor } from "./interface";
import type { ExecutorResult } from "../types/executor";
import { loadScript } from "../lib/script-loader";
import { withRetry } from "../lib/retry";
import { loadConfig } from "../lib/config";

export class PowerShellExecutor implements IOutlookExecutor {
  private psPath: string;

  constructor(psPath = "powershell.exe") {
    this.psPath = psPath;
  }

  async execute<T>(
    scriptCategory: string,
    scriptName: string,
    params: Record<string, unknown> = {}
  ): Promise<ExecutorResult<T>> {
    const script = await loadScript(scriptCategory, scriptName, params);

    return withRetry(async () => {
      const proc = Bun.spawn(
        [this.psPath, "-NoProfile", "-NonInteractive", "-Command", script],
        { stdout: "pipe", stderr: "pipe" }
      );

      const [stdout, stderr, exitCode] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
      ]);

      const stderrTrim = stderr.trim();

      // COM busy - retry
      if (
        stderrTrim.includes("0x80010001") ||
        stderrTrim.includes("RPC_E_CALL_REJECTED")
      ) {
        throw new Error(stderrTrim);
      }

      // Outlook not running
      if (
        stderrTrim.includes("0x80080005") ||
        stderrTrim.includes("CO_E_SERVER_EXEC_FAILURE") ||
        (stderrTrim.includes("Outlook.Application") && stderrTrim.includes("failed"))
      ) {
        return {
          success: false,
          error: "Outlook is not running. Please start Outlook and try again.",
          exitCode,
        };
      }

      if (exitCode !== 0) {
        const errMsg = stderrTrim || `PowerShell exited with code ${exitCode}`;
        return { success: false, error: errMsg, exitCode };
      }

      const output = stdout.trim();
      if (!output) {
        if (stderrTrim) {
          return { success: false, error: stderrTrim, exitCode };
        }
        return { success: true, data: undefined as T };
      }

      try {
        const data = JSON.parse(output) as T;
        return { success: true, data };
      } catch {
        return { success: false, error: `Failed to parse JSON output: ${output.slice(0, 200)}`, exitCode };
      }
    });
  }
}
