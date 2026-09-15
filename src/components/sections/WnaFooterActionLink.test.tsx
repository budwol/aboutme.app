import { describe, expect, it, jest } from "@jest/globals";
import WnaFooterActionLink from "@components/sections/WnaFooterActionLink";
import TestRenderer, { act } from "react-test-renderer";

describe("WnaFooterActionLink", () => {
  it("calls the handler and updates hover styling", () => {
    const onPress = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaFooterActionLink
          appColors={{ accent5: "#00aacc" } as never}
          appStyle={{ textMicro: {} } as never}
          label="actionShowMore"
          onPress={onPress}
        />,
      );
    });

    const button = tree!.root.find(
      (node: {
        props: {
          onClick?: (() => void) | undefined;
          onMouseEnter?: (() => void) | undefined;
          onMouseLeave?: (() => void) | undefined;
        };
      }) =>
        typeof node.props.onClick === "function" &&
        typeof node.props.onMouseEnter === "function" &&
        typeof node.props.onMouseLeave === "function",
    );

    expect(button.props.type).toBe("button");
    expect(button.props.style).toEqual(
      expect.objectContaining({
        appearance: "none",
        alignItems: "center",
        borderStyle: "solid",
        boxSizing: "border-box",
        cursor: "pointer",
        display: "flex",
        fontFamily: "inherit",
        fontSize: "inherit",
        justifyContent: "center",
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 8,
        paddingBottom: 8,
      }),
    );
    expect(button.props.style.backgroundColor).toBe("rgba(0,170,204,0.08)");

    act(() => {
      button.props.onMouseEnter();
    });

    expect(button.props.style.backgroundColor).toBe("rgba(0,170,204,0.14)");

    act(() => {
      button.props.onMouseLeave();
      button.props.onClick();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
