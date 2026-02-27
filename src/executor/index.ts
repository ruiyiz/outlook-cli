import type { IOutlookExecutor } from "./interface";
import { PowerShellExecutor } from "./powershell-executor";
import { loadConfig } from "../lib/config";

let _executor: IOutlookExecutor | null = null;

export async function createExecutor(): Promise<IOutlookExecutor> {
  if (_executor) return _executor;
  const config = await loadConfig();
  _executor = new PowerShellExecutor(config.powershellPath);
  return _executor;
}
