import { describe, expect, it } from "@jest/globals";
import { shouldIgnoreLogMessage } from "@utils/logger.base";

describe("shouldIgnoreLogMessage", () => {
  it("filters known noisy warnings", () => {
    expect(
      shouldIgnoreLogMessage(
        "Blocked aria-hidden on an element because its descendant retained focus",
      ),
    ).toBe(true);
  });

  it("leaves unrelated messages alone", () => {
    expect(shouldIgnoreLogMessage("A real application error")).toBe(false);
  });
});
