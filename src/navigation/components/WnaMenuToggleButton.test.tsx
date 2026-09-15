import { describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import WnaMenuToggleButton from "@/navigation/components/WnaMenuToggleButton";

const mockOpenDrawer = jest.fn();

jest.mock("@/state/WnaAppContext", () => ({
  useWnaAppLifecycle: () => ({
    openDrawer: mockOpenDrawer,
  }),
}));

jest.mock("@components/buttons/WnaButtonHeader", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaButtonHeader(props: unknown) {
    return createElement("WnaButtonHeader", props as Record<string, unknown>);
  };
});

describe("WnaMenuToggleButton", () => {
  it("updates the header text when translation output changes", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaMenuToggleButton
          appColors={{ isDark: false } as never}
          appStyle={{} as never}
          t={(() => "Menu") as never}
        />,
      );
    });

    act(() => {
      tree!.update(
        <WnaMenuToggleButton
          appColors={{ isDark: false } as never}
          appStyle={{} as never}
          t={(() => "Menue") as never}
        />,
      );
    });

    const buttonHeader = tree!.root.findByType("WnaButtonHeader");

    expect(buttonHeader.props.text).toBe("Menue");
  });

  it("opens the drawer when pressed", () => {
    mockOpenDrawer.mockClear();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaMenuToggleButton
          appColors={{ isDark: false } as never}
          appStyle={{} as never}
          t={(() => "Menu") as never}
        />,
      );
    });

    const buttonHeader = tree!.root.findByType("WnaButtonHeader");

    act(() => {
      (buttonHeader.props as { onPress: () => void }).onPress();
    });

    expect(mockOpenDrawer).toHaveBeenCalledTimes(1);
  });
});
