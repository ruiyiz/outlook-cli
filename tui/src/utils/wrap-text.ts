export function wrapText(text: string, width: number): string[] {
  const lines: string[] = [];
  for (const rawLine of text.split("\n")) {
    if (rawLine.length <= width) {
      lines.push(rawLine);
      continue;
    }
    const words = rawLine.split(" ");
    let current = "";
    for (const word of words) {
      if (word.length > width) {
        if (current) { lines.push(current); current = ""; }
        for (let i = 0; i < word.length; i += width) {
          lines.push(word.slice(i, i + width));
        }
        continue;
      }
      const candidate = current ? current + " " + word : word;
      if (candidate.length > width) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    lines.push(current);
  }
  return lines;
}
