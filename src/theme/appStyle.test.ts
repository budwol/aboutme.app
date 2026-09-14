import { describe, expect, it } from "@jest/globals";
import { themePalettes } from "@constants/theme/themePalettes";
import { FontFamilies } from "@constants/theme/fontFamilies";
import AppStyle, { setAppStyle } from "@/theme/appStyle";

describe("appStyle", () => {
  it("builds the shared app style object from a color palette", () => {
    const style = setAppStyle(themePalettes.light);

    // Regression test: this style used the React-Native-only
    // `paddingHorizontal` property. Consumers spread this object directly
    // onto a plain DOM `style` prop, and React silently drops properties
    // it doesn't recognize as real CSS — so the intended 16px horizontal
    // margin around the home page's centered content rendered as 0px in
    // every browser. `paddingInline` is the real CSS equivalent.
    // `boxSizing: "border-box"` is required alongside it so the 100%
    // width already includes that padding instead of adding to it.
    expect(style.containerCenterMaxWidth).toEqual({
      maxWidth: 1120,
      width: "100%",
      boxSizing: "border-box",
      alignSelf: "center",
      paddingInline: 16,
    });
    expect(style.tabBarStyle).toEqual({
      backgroundColor: themePalettes.light.white,
      borderTopWidth: 0,
      borderBottomWidth: 0,
    });
    expect(style.textNeutralSmall).toEqual({
      fontSize: 14,
      fontWeight: "500",
      lineHeight: "18px",
      fontFamily: FontFamilies.UI,
      color: themePalettes.light.coolgray6,
    });
    expect(style.separatorHorizontal).toEqual({
      minHeight: 1,
      margin: 16,
      minWidth: 128,
      width: "90%",
    });
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
