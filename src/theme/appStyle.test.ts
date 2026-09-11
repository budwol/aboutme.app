import { describe, expect, it } from "@jest/globals";
import { themePalettes } from "@constants/theme/themePalettes";
import { setAppStyle } from "@/theme/appStyle";

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
});
