import { join } from "path";

const SCRIPTS_DIR = join(import.meta.dir, "..", "scripts");

export function escapePs(value: string): string {
  // Double single quotes and wrap in single quotes (no interpolation)
  return "'" + value.replace(/'/g, "''") + "'";
}

export function escapeParam(value: unknown): string {
  if (typeof value === "string") return escapePs(value);
  if (typeof value === "boolean") return value ? "$true" : "$false";
  if (typeof value === "number") return String(value);
  if (value === null || value === undefined) return "''";
  return escapePs(String(value));
}

export async function loadScript(
  category: string,
  name: string,
  params: Record<string, unknown> = {}
): Promise<string> {
  const path = join(SCRIPTS_DIR, category, `${name}.ps1`);
  const file = Bun.file(path);
  let content = await file.text();

  for (const [key, value] of Object.entries(params)) {
    const escaped = escapeParam(value);
    content = content.replaceAll(`{{${key}}}`, escaped);
  }

  return "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8\n" + content;
}
