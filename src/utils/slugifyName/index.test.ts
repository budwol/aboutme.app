import { describe, expect, it } from "@jest/globals";
import { slugifyName } from "@utils/slugifyName";

describe("slugifyName", () => {
  it("replaces spaces with underscores", () => {
    expect(slugifyName("Jane Example")).toBe("Jane_Example");
  });

  it("spells out German umlauts and ß instead of dropping them", () => {
    expect(slugifyName("Björn Müller-Straße")).toBe("Bjoern_Mueller-Strasse");
  });

  it("strips characters that are neither filesystem- nor URL-safe", () => {
    expect(slugifyName("Anne O'Connor (Dr.)")).toBe("Anne_OConnor_Dr");
  });

  it("trims leading and trailing whitespace before slugifying", () => {
    expect(slugifyName("  Jane Example  ")).toBe("Jane_Example");
  });
});
