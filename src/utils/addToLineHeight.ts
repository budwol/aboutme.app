export function addToLineHeight(
  lineHeight: string | number | undefined,
  delta: number,
  fallback: number,
): string {
  const base =
    typeof lineHeight === "string" ? parseFloat(lineHeight) : lineHeight;
  return `${(base ?? fallback) + delta}px`;
}
