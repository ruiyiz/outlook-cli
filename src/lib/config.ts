import { join } from "path";
import { homedir } from "os";

const CONFIG_DIR = join(homedir(), ".outlook-cli");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface Config {
  defaultLimit: number;
  defaultFolder: string;
  powershellPath: string;
}

const DEFAULTS: Config = {
  defaultLimit: 20,
  defaultFolder: "Inbox",
  powershellPath: "powershell.exe",
};

export async function loadConfig(): Promise<Config> {
  try {
    const file = Bun.file(CONFIG_FILE);
    if (await file.exists()) {
      const data = await file.json();
      return { ...DEFAULTS, ...data };
    }
  } catch {
    // use defaults
  }
  return { ...DEFAULTS };
}

export function getConfigDir(): string {
  return CONFIG_DIR;
}

export async function ensureConfigDir(): Promise<void> {
  await Bun.write(join(CONFIG_DIR, ".gitkeep"), "");
}
