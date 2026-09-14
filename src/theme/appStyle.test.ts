import { describe, expect, it } from "@jest/globals";
import { themePalettes } from "@constants/theme/themePalettes";
import { FontFamilies } from "@constants/theme/fontFamilies";
import AppStyle, { setAppStyle } from "@/theme/appStyle";

describe("appStyle", () => {
  it("builds the shared app style object from a color palette", () => {
    const style = setAppStyle(themePalettes.light);

    expect(style.containerCenterMaxWidth).toEqual(
      expect.objectContaining({
        width: "100%",
        alignSelf: "center",
        paddingHorizontal: 16,
      }),
    );
    expect(style.tabBarStyle).toEqual(
      expect.objectContaining({ backgroundColor: themePalettes.light.white }),
    );
    expect(style.textNeutralSmall).toEqual(
      expect.objectContaining({
        color: "#3e3e3e",
        fontFamily:
          '"Manrope","system-ui","-apple-system","BlinkMacSystemFont","Segoe UI",sans-serif',
      }),
    );
    expect(style.separatorHorizontal).toEqual(
      expect.objectContaining({
        minHeight: 1,
        minWidth: 128,
        width: "90%",
      }),
    );
  });

  it("gives every text style an explicit font-family so it never silently falls back to the browser default", () => {
    // Regression test: `textNeutralSubtitle` was missing `fontFamily` while
    // every sibling text style had it — invisible under react-native-web,
    // but the hero job-title rendered in the browser's serif default once
    // rendered as a raw DOM span. This asserts, exhaustively and by key
    // rather than by naming a handful of styles, that no `text*` entry can
    // silently regress the same way again.
    const style = setAppStyle(themePalettes.light);
    const textStyleKeys = Object.keys(style).filter((key) =>
      key.startsWith("text"),
    ) as (keyof AppStyle)[];

    expect(textStyleKeys.sort()).toEqual(
      [
        "textExtraLarge",
        "textLarge",
        "textMedium",
        "textSmall",
        "textMicro",
        "textNeutralExtraLarge",
        "textNeutralLarge",
        "textNeutralMedium",
        "textNeutralSmall",
        "textNeutralMicro",
        "textNeutralLabel",
        "textTitleLarge",
        "textNeutralTitleLarge",
        "textNeutralSubtitle",
        "textInput",
      ].sort(),
    );

    textStyleKeys.forEach((key) => {
      expect(style[key]).toEqual(
        expect.objectContaining({ fontFamily: FontFamilies.UI }),
      );
    });
  });
});
