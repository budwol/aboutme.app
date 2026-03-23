import { describe, expect, it } from "@jest/globals";
import {
  tabScreenConfigDe,
  tabScreenConfigEn,
} from "@/navigation/config/wnaTabLayoutConfig";

describe("wnaTabLayoutConfig", () => {
  it("keeps the english and german tab groups aligned", () => {
    expect(tabScreenConfigEn).toHaveLength(5);
    expect(tabScreenConfigDe).toHaveLength(5);
    expect(tabScreenConfigEn.map((screen) => screen.name)).toEqual([
      "index",
      "projects",
      "experience",
      "contact",
      "menu",
    ]);
    expect(tabScreenConfigDe.map((screen) => screen.name)).toEqual([
      "index",
      "projekte",
      "taetigkeiten",
      "kontakt",
      "menu",
    ]);
  });
});
