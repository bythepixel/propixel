export function detectBodyFieldCount(html: string): number {
  const matches = html.match(/\{\{?body_(\d+)\}?\}/g) ?? [];
  if (matches.length === 0) return 1;
  let max = 1;
  for (const match of matches) {
    const numMatch = match.match(/body_(\d+)/);
    const n = numMatch ? Number(numMatch[1]) : 1;
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max;
}
