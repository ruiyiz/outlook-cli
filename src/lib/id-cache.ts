import { join } from "path";
import { homedir } from "os";

const CACHE_DIR = join(homedir(), ".outlook-cli");

function cachePath(name: string): string {
  return join(CACHE_DIR, `last-${name}-list.json`);
}

export async function saveIdCache(name: string, ids: string[]): Promise<void> {
  await Bun.write(cachePath(name), JSON.stringify(ids));
}

export async function resolveId(name: string, idOrIndex: string): Promise<string> {
  // If it looks like a full EntryID (long hex string), return as-is
  if (idOrIndex.length > 20 && /^[0-9A-Fa-f]+$/.test(idOrIndex)) {
    return idOrIndex;
  }

  const idx = parseInt(idOrIndex, 10);
  if (isNaN(idx) || idx < 1) {
    throw new Error(`Invalid ID: ${idOrIndex}`);
  }

  const file = Bun.file(cachePath(name));
  if (!(await file.exists())) {
    throw new Error(`No cached ${name} list. Run 'outlook ${name} list' first.`);
  }

  const ids: string[] = await file.json();
  if (idx > ids.length) {
    throw new Error(`Index ${idx} out of range (${ids.length} items cached)`);
  }

  return ids[idx - 1];
}
