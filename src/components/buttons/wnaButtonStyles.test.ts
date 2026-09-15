import { describe, expect, it } from "@jest/globals";
import Colors from "@constants/theme/colors";
import {
  actionButtonRightConstants,
  appLayoutConstants,
} from "@constants/layoutConstants";
import { convertHexToRgba } from "@utils/colorConverter";
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

    // Regression test: this style combines a fixed `height` with
    // `padding: 12` and a `borderWidth` on a real DOM element.
    // Content-box (the browser default) would render it 26px taller
    // (2 * padding + 2 * border) than `actionButtonRightConstants.size`.
    expect(style).toEqual({
      backgroundColor: "transparent",
      borderColor: convertHexToRgba(colors.coolgray2, 0.5),
      borderWidth: 1,
      borderStyle: "solid",
      height: actionButtonRightConstants.size,
      boxSizing: "border-box",
      borderRadius: appLayoutConstants.globalCornerRadius,
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

    // Regression test: this style combines a fixed `height`/`width` with
    // a `borderWidth` on a real DOM element. Content-box (the browser
    // default) would render it 2px taller/wider than
    // `actionButtonRightConstants.size`, breaking the circular shape
    // computed from that same size.
    expect(style).toEqual({
      height: actionButtonRightConstants.size,
      width: actionButtonRightConstants.size,
      boxSizing: "border-box",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: convertHexToRgba(colors.coolgray2, 0.5),
      borderRadius: actionButtonRightConstants.size / 2,
      backgroundColor: convertHexToRgba(colors.staticBlack, 0.6),
      alignItems: "center",
      justifyContent: "center",
    });
  });
});
