import { describe, expect, it } from "@jest/globals";
import { formatFileSize } from "@utils/formatFileSize";

describe("formatFileSize", () => {
  it("formats bytes below 1 KB without a decimal", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("formats kilobytes with one decimal", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("formats megabytes with one decimal", () => {
    expect(formatFileSize(1_572_864)).toBe("1.5 MB");
  });

  it("formats gigabytes with one decimal", () => {
    expect(formatFileSize(1_610_612_736)).toBe("1.5 GB");
  });

  it("does not scale a unit past GB", () => {
    expect(formatFileSize(1024 ** 4)).toBe("1024.0 GB");
  });

  it("returns an empty string for a negative value", () => {
    expect(formatFileSize(-1)).toBe("");
  });

  it("returns an empty string for a non-finite value", () => {
    expect(formatFileSize(NaN)).toBe("");
    expect(formatFileSize(Infinity)).toBe("");
  });
});
