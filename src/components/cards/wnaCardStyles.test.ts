import { describe, expect, it } from "@jest/globals";
import {
  getCardBorderStyle,
  getGroupedCardRadius,
} from "@components/cards/wnaCardStyles";
import Colors from "@constants/theme/colors";

function createColors(): Colors {
  return {
    coolgray2: "#222222",
  } as Colors;
}

describe("wnaCardStyles", () => {
  it("returns rounded corners for standalone cards", () => {
    expect(getGroupedCardRadius("standalone")).toMatchObject({
      borderTopLeftRadius: expect.any(Number),
      borderTopRightRadius: expect.any(Number),
      borderBottomLeftRadius: expect.any(Number),
      borderBottomRightRadius: expect.any(Number),
    });
  });

  it("returns flat top corners for grouped middle cards", () => {
    expect(getGroupedCardRadius("middle")).toMatchObject({
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    });
  });

  it("returns the shared card border style", () => {
    const style = getCardBorderStyle(createColors());

    expect(style).toMatchObject({
      borderWidth: 1,
    });
    expect(typeof style.borderColor).toBe("string");
  });
});
