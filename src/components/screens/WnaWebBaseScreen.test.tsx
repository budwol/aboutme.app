import WnaWebBaseScreen from "@components/screens/WnaWebBaseScreen";
import { describe, expect, it } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";

describe("WnaWebBaseScreen", () => {
  it("sets the browser title from the page title on mount", () => {
    Object.defineProperty(globalThis, "document", {
      value: { title: "Initial" },
      configurable: true,
      writable: true,
    });

    act(() => {
      TestRenderer.create(
        <WnaWebBaseScreen title="Portfolio">
          <></>
        </WnaWebBaseScreen>,
      );
    });

    expect(globalThis.document.title).toBe("Portfolio");
  });

  it("updates the browser title when the title prop changes", () => {
    Object.defineProperty(globalThis, "document", {
      value: { title: "Project" },
      configurable: true,
      writable: true,
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaWebBaseScreen title="Start">
          <></>
        </WnaWebBaseScreen>,
      );
    });

    expect(globalThis.document.title).toBe("Start");

    act(() => {
      tree!.update(
        <WnaWebBaseScreen title="Other">
          <></>
        </WnaWebBaseScreen>,
      );
    });

    expect(globalThis.document.title).toBe("Other");
  });

  it("leaves the browser title untouched when no title is given", () => {
    Object.defineProperty(globalThis, "document", {
      value: { title: "Unchanged" },
      configurable: true,
      writable: true,
    });

    act(() => {
      TestRenderer.create(
        <WnaWebBaseScreen>
          <></>
        </WnaWebBaseScreen>,
      );
    });

    expect(globalThis.document.title).toBe("Unchanged");
  });

  it("renders its children", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaWebBaseScreen title="Portfolio">
          <span>content</span>
        </WnaWebBaseScreen>,
      );
    });

    expect(tree!.root.findByType("span").props.children).toBe("content");
  });
});
