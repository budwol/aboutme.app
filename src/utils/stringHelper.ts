export function cleanAndTruncate(
  input: string,
  maxLength: number = 64,
): string {
  const cleaned = input.replace(/[\r\n]+/g, "");

  if (cleaned.length > maxLength)
    return cleaned.substring(0, maxLength - 3) + "...";

  return cleaned;
}
