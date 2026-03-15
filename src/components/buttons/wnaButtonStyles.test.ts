import { describe, expect, it } from "@jest/globals";
import Colors from "@constants/theme/colors";
import {
  createButtonOutlineStyle,
  createButtonTextContainerStyle,
  createRoundIconButtonStyle,
} from "@components/buttons/wnaButtonStyles";

function createColors(): Colors {
  return {
    coolgray2: "#222222",
    background: "#ffffff",
    staticBlack: "#000000",
  } as Colors;
}

describe("wnaButtonStyles", () => {
  it("builds the default text button container style", () => {
    const colors = createColors();
    const style = createButtonTextContainerStyle(colors, "transparent");

    expect(style).toMatchObject({
      backgroundColor: "transparent",
      borderWidth: 1,
      overflow: "hidden",
      padding: 12,
    });
  });

  it("builds the shared outline style", () => {
    const colors = createColors();
    const style = createButtonOutlineStyle(colors);

    expect(style.outlineOffset).toBe(2);
    expect(typeof style.outlineColor).toBe("string");
  });

  it("builds the shared round icon button style", () => {
    const colors = createColors();
    const style = createRoundIconButtonStyle(colors);

    expect(style).toMatchObject({
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    });
  });
});
