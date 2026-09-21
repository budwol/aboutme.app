const UNITS = ["B", "KB", "MB", "GB"] as const;

// 1,536,000 -> "1.5 MB". Byte values only need one decimal once they've
// scaled past B (a whole-KB/MB count reads as precise enough already;
// hundredths of a megabyte don't help a candidate decide whether a
// download is too big to email). Anything not a finite, non-negative
// number (a missing lookup, a malformed manifest entry) returns "" rather
// than "NaN B" or "-3 B", so a caller can just skip the label instead of
// having to check first.
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "";
  }

  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const decimals = unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(decimals)} ${UNITS[unitIndex]}`;
}
