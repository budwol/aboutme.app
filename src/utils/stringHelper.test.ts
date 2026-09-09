import { describe, expect, it } from "@jest/globals";
import { cleanAndTruncate } from "@utils/stringHelper";

describe("stringHelper", () => {
  it("removes line breaks without truncating short strings", () => {
    expect(cleanAndTruncate("Hello\nWorld\r\n", 64)).toBe("HelloWorld");
  });

  it("truncates long cleaned strings with an ellipsis", () => {
    expect(cleanAndTruncate("1234567890", 8)).toBe("12345...");
  });
});
