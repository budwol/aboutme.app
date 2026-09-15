import { describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import WnaDrawerLayout from "@/navigation/components/WnaDrawerLayout";

const mockUseWnaAppLifecycle = jest.fn();
const mockUseWnaTheme = jest.fn();

jest.mock("@/state/WnaAppContext", () => ({
  useWnaAppLifecycle: (...args: unknown[]) => mockUseWnaAppLifecycle(...args),
  useWnaTheme: (...args: unknown[]) => mockUseWnaTheme(...args),
}));

jest.mock("@/navigation/components/WnaDrawerMenu", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");

  return function MockWnaDrawerMenu() {
    return ReactModule.createElement("WnaDrawerMenu");
  };
});

jest.mock("@/navigation/router/WnaRoutes", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");

  return function MockWnaRoutes() {
    return ReactModule.createElement("WnaRoutes");
  };
});

describe("WnaDrawerLayout", () => {
  const lightColors = {
    isDark: false,
    white: "#ffffff",
    staticCoolgray8: "#222222",
  };
  const darkColors = {
    isDark: true,
    white: "#ffffff",
    staticCoolgray8: "#222222",
  };

  it("renders the routed content and the shared drawer menu when open", () => {
    mockUseWnaTheme.mockReturnValue({ appColors: lightColors });
    mockUseWnaAppLifecycle.mockReturnValue({
      isDrawerOpen: true,
      closeDrawer: jest.fn(),
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaDrawerLayout />);
    });

    expect(tree!.root.findByType("WnaRoutes")).toBeTruthy();
    expect(tree!.root.findByType("WnaDrawerMenu")).toBeTruthy();

    const panel = tree!.root.findByProps({ "data-testid": "wna-drawer-panel" });
    expect(panel.props.style.backgroundColor).toBe("#ffffff");
  });

  it("uses the dark drawer background in dark mode", () => {
    mockUseWnaTheme.mockReturnValue({ appColors: darkColors });
    mockUseWnaAppLifecycle.mockReturnValue({
      isDrawerOpen: true,
      closeDrawer: jest.fn(),
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaDrawerLayout />);
    });

    const panel = tree!.root.findByProps({ "data-testid": "wna-drawer-panel" });
    expect(panel.props.style.backgroundColor).toBe("#222222");
  });

  it("keeps the drawer panel in the DOM but non-interactive when closed", () => {
    mockUseWnaTheme.mockReturnValue({ appColors: lightColors });
    mockUseWnaAppLifecycle.mockReturnValue({
      isDrawerOpen: false,
      closeDrawer: jest.fn(),
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaDrawerLayout />);
    });

    expect(tree!.root.findByType("WnaRoutes")).toBeTruthy();
    expect(
      tree!.root.findAllByProps({ "data-testid": "wna-drawer-panel" }),
    ).toHaveLength(1);
    const overlay = tree!.root.findByProps({ id: "wna-drawer-overlay" });
    expect(overlay.props.style.pointerEvents).toBe("none");
  });

  it("activates the drawer panel transition on the next frame after opening", () => {
    jest.useFakeTimers();
    mockUseWnaTheme.mockReturnValue({ appColors: lightColors });
    mockUseWnaAppLifecycle.mockImplementation(() => ({
      isDrawerOpen: true,
      closeDrawer: jest.fn(),
    }));

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaDrawerLayout />);
    });

    const backdropBefore = tree!.root.findByProps({
      "data-testid": "wna-drawer-backdrop",
    });
    expect(backdropBefore.props.style.opacity).toBe(0);

    act(() => {
      jest.advanceTimersByTime(16);
    });

    const backdropAfter = tree!.root.findByProps({
      "data-testid": "wna-drawer-backdrop",
    });
    expect(backdropAfter.props.style.opacity).toBe(1);

    jest.useRealTimers();
  });

  it("starts already active when no real document body is available to animate against", () => {
    const bodySpy = jest
      .spyOn(document, "body", "get")
      .mockReturnValue(undefined as never);
    mockUseWnaTheme.mockReturnValue({ appColors: lightColors });
    mockUseWnaAppLifecycle.mockImplementation(() => ({
      isDrawerOpen: true,
      closeDrawer: jest.fn(),
    }));

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaDrawerLayout />);
    });

    const backdrop = tree!.root.findByProps({
      "data-testid": "wna-drawer-backdrop",
    });
    expect(backdrop.props.style.opacity).toBe(1);

    bodySpy.mockRestore();
  });

  it("closes on Escape and disables pointer events on the overlay", () => {
    jest.useFakeTimers();
    const escapeHandlers: ((event: { key: string }) => void)[] = [];
    const addEventListenerSpy = jest
      .spyOn(document, "addEventListener")
      .mockImplementation((type: string, listener: unknown) => {
        if (type === "keydown") {
          escapeHandlers.push(listener as (event: { key: string }) => void);
        }
      });
    mockUseWnaTheme.mockReturnValue({ appColors: lightColors });
    const mockCloseDrawer = jest.fn();
    let isOpen = true;
    mockUseWnaAppLifecycle.mockImplementation(() => ({
      isDrawerOpen: isOpen,
      closeDrawer: mockCloseDrawer,
    }));

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaDrawerLayout />);
    });

    act(() => {
      jest.advanceTimersByTime(16);
    });

    act(() => {
      escapeHandlers.forEach((handler) => handler({ key: "Enter" }));
    });

    expect(mockCloseDrawer).not.toHaveBeenCalled();

    act(() => {
      escapeHandlers.forEach((handler) => handler({ key: "Escape" }));
    });

    expect(mockCloseDrawer).toHaveBeenCalledTimes(1);

    isOpen = false;

    act(() => {
      tree!.update(<WnaDrawerLayout />);
    });

    const overlay = tree!.root.findByProps({ id: "wna-drawer-overlay" });
    expect(overlay.props.style.pointerEvents).toBe("none");
    const panel = tree!.root.findByProps({
      "data-testid": "wna-drawer-panel",
    });
    expect(panel.props.style.transform).toBe("translateX(100%)");

    addEventListenerSpy.mockRestore();
    jest.useRealTimers();
  });
});
