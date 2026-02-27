import type { IOutlookExecutor } from "./interface";
import { PowerShellExecutor } from "./powershell-executor";
import { BridgeExecutor } from "./bridge-executor";
import { DaemonExecutor } from "./daemon-executor";
import { loadConfig } from "../lib/config";

let _executor: IOutlookExecutor | null = null;

export async function createExecutor(): Promise<IOutlookExecutor> {
  if (_executor) return _executor;
  const env = process.env.OUTLOOK_EXECUTOR;
  if (env === "spawn") {
    const config = await loadConfig();
    _executor = new PowerShellExecutor(config.powershellPath);
  } else if (env === "bridge") {
    const config = await loadConfig();
    _executor = new BridgeExecutor(config.powershellPath);
  } else {
    _executor = new DaemonExecutor();
  }
  return _executor;
}
