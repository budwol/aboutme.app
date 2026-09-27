import { describe, expect, it } from "@jest/globals";
import { getDocumentLang } from "@utils/documentDisplay";

describe("getDocumentLang", () => {
  it("returns the language the document itself is written in", () => {
    expect(getDocumentLang("cvDe")).toBe("de");
    expect(getDocumentLang("applicationPackageDe")).toBe("de");
    expect(getDocumentLang("cvEn")).toBe("en");
    expect(getDocumentLang("portfolioAtsEn")).toBe("en");
  });
});
