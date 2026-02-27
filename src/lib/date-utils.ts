export function today(): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function thisWeek(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function parseDate(s: string): string {
  return new Date(s).toISOString();
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString();
}
