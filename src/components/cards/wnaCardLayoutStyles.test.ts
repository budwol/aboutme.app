import { describe, expect, it } from "@jest/globals";
import Colors from "@constants/theme/colors";
import { createVerticalCardContainerStyle } from "@components/cards/wnaCardLayoutStyles";

function createColors(): Colors {
  return {
    warmgray6: "#666666",
    coolgray2: "#222222",
  } as Colors;
}

describe("wnaCardLayoutStyles", () => {
  it("builds the shared vertical card container style", () => {
    const style = createVerticalCardContainerStyle(createColors(), 0.6);

    expect(style).toMatchObject({
      borderWidth: 1,
      overflow: "hidden",
      opacity: 0.6,
    });
    expect(typeof style.backgroundColor).toBe("string");
    expect(typeof style.borderColor).toBe("string");
  });
});
