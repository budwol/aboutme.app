import { describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import WnaButtonIconText from "@components/buttons/WnaButtonIconText";
import {
  actionButtonRightConstants,
  appLayoutConstants,
} from "@constants/layoutConstants";
import { StaticColors } from "@constants/theme/staticColors";
import { createShadowStyle } from "@components/effects/wnaShadowStyle";
import { createButtonOutlineStyle } from "@components/buttons/wnaButtonStyles";

jest.mock("@components/icon/WnaIcon/WnaIcon", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaIcon(props: unknown) {
    return createElement("WnaIcon", props as Record<string, unknown>);
  };
});

jest.mock("@components/buttons/WnaButtonTextContent", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaButtonTextContent(props: unknown) {
    return createElement(
      "WnaButtonTextContent",
      props as Record<string, unknown>,
    );
  };
});

describe("WnaButtonIconText", () => {
  it("passes icon, text and disabled state into the composed button", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;
    const appStyle = { textNeutralMedium: { fontFamily: "Manrope" } } as never;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonIconText
          appColors={
            {
              isDark: false,
              staticWhite: "#fff",
              staticWarmgray8: "#ccc",
              staticWarmgray7: "#333",
              background: "#111",
            } as never
          }
          appStyle={appStyle}
          text="Open profile"
          iconName="account"
          onPress={() => {}}
          t={((value: string) => value) as never}
          checkInternetConnection={false}
          disabled={true}
        />,
      );
    });

    const button = tree!.root.findByType("button");
    const content = tree!.root.findByType("WnaButtonTextContent");
    const testAppColors = {
      isDark: false,
      staticWhite: "#fff",
      staticWarmgray8: "#ccc",
      staticWarmgray7: "#333",
      background: "#111",
    } as never;
    expect(button.props.disabled).toBe(true);
    expect(button.props["aria-disabled"]).toBe(true);
    // Regression test: `marginInline` was `marginHorizontal`, a
    // React-Native-only property. React silently drops it when writing
    // to a plain DOM `style` attribute, so this button rendered with no
    // horizontal margin at all instead of the intended 16px gap on each
    // side.
    expect(button.props.style).toEqual({
      height: actionButtonRightConstants.size,
      borderRadius: appLayoutConstants.globalCornerRadius,
      overflow: "hidden",
      marginInline: 16,
      ...createShadowStyle(),
      ...createButtonOutlineStyle(testAppColors),
      alignItems: "center",
      appearance: "none",
      backgroundColor: "#ccc",
      borderColor: StaticColors.staticWarmgray6,
      borderStyle: "solid",
      borderWidth: 1,
      boxSizing: "border-box",
      cursor: "not-allowed",
      display: "flex",
      opacity: 0.5,
      padding: 0,
    });
    expect(content.props.text).toBe("Open profile");
    expect(content.props.childrenLeft.props.iconName).toBe("account");
    // Regression test: `appStyle` was accepted as a prop type but never
    // destructured or forwarded, so this button's visible label silently
    // fell back to a font-family-less style object and rendered in the
    // browser's default sans-serif instead of Manrope.
    expect(content.props.appStyle).toBe(appStyle);
  });

  it("updates rendered content when text and icon change", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonIconText
          appColors={
            {
              isDark: false,
              staticWhite: "#fff",
              staticWarmgray8: "#ccc",
              staticWarmgray7: "#333",
              background: "#111",
            } as never
          }
          text="Open profile"
          iconName="account"
          onPress={() => {}}
          t={((value: string) => value) as never}
          checkInternetConnection={false}
          disabled={false}
        />,
      );
    });

    act(() => {
      tree!.update(
        <WnaButtonIconText
          appColors={
            {
              isDark: false,
              staticWhite: "#fff",
              staticWarmgray8: "#ccc",
              staticWarmgray7: "#333",
              background: "#111",
            } as never
          }
          text="View details"
          iconName="rocket-launch-outline"
          onPress={() => {}}
          t={((value: string) => value) as never}
          checkInternetConnection={false}
          disabled={false}
        />,
      );
    });

    const content = tree!.root.findByType("WnaButtonTextContent");

    expect(content.props.text).toBe("View details");
    expect(content.props.childrenLeft.props.iconName).toBe(
      "rocket-launch-outline",
    );
  });

  it("falls back to the dark background color and a custom border width", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;
    const darkAppColors = {
      isDark: true,
      staticWhite: "#fff",
      staticWarmgray8: "#ccc",
      staticWarmgray7: "#333",
      background: "#111",
    } as never;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonIconText
          appColors={darkAppColors}
          text="Open profile"
          iconName="account"
          onPress={() => {}}
          borderWidth={3}
        />,
      );
    });

    const button = tree!.root.findByType("button");

    expect(button.props.style).toEqual({
      height: actionButtonRightConstants.size,
      borderRadius: appLayoutConstants.globalCornerRadius,
      overflow: "hidden",
      marginInline: 16,
      ...createShadowStyle(),
      ...createButtonOutlineStyle(darkAppColors),
      alignItems: "center",
      appearance: "none",
      backgroundColor: "#333",
      borderColor: StaticColors.staticWarmgray6,
      borderStyle: "solid",
      borderWidth: 3,
      boxSizing: "border-box",
      cursor: "pointer",
      display: "flex",
      opacity: 1,
      padding: 0,
    });

    act(() => {
      button.props.onMouseEnter();
    });
    expect(button.props.style.opacity).toBe(0.9);

    act(() => {
      button.props.onMouseDown();
    });
    expect(button.props.style.opacity).toBe(0.8);

    act(() => {
      button.props.onMouseUp();
      button.props.onMouseLeave();
    });
    expect(button.props.style.opacity).toBe(1);
  });
});
