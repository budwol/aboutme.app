/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";

jest.mock("expo-router/html", () => ({
  ScrollViewStyleReset: () =>
    require("react").createElement("ScrollViewStyleReset"),
}));

describe("+html", () => {
  it("renders the root html shell and removes Expo's injected font node", () => {
    const remove = jest.fn();
    const getElementByIdSpy = jest
      .spyOn(document, "getElementById")
      .mockImplementation(() => ({ remove }) as unknown as HTMLElement);
    const RootHtml = require("./+html").default;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <RootHtml>
          <main />
        </RootHtml>,
      );
    });

    expect(remove).toHaveBeenCalledTimes(1);
    expect(tree!.root.findByType("html").props.lang).toBe("de");
    expect(tree!.root.findByType("title").props.children).toBe("AboutMe");
    expect(tree!.root.findByType("main")).toBeTruthy();

    const shellStyles = tree!.root.findByType("style").props.children as string;
    expect(shellStyles).toContain(".wna-accent-bar-pulse");
    expect(shellStyles).toContain("@keyframes wna-accent-bar-pulse");
    expect(shellStyles).toContain("@keyframes wna-accent-bar-pulse-hero");
    expect(shellStyles).toContain("scaleX(.2142857)");
    expect(shellStyles).toContain("wna-accent-bar-pulse-hero 60s");
    expect(shellStyles).toContain(".wna-hero-shape");
    expect(shellStyles).toContain("@keyframes wna-hero-shape-swing");
    expect(shellStyles).toContain("@keyframes wna-hero-shape-swing-positive");
    expect(shellStyles).toContain("@keyframes wna-hero-shape-swing-negative");
    expect(shellStyles).toContain("wna-hero-shape-swing-positive 13s");
    expect(shellStyles).toContain("wna-hero-shape-swing-negative 13s");

    getElementByIdSpy.mockRestore();
  });

  it("skips removing the font node when it is absent", () => {
    const getElementByIdSpy = jest
      .spyOn(document, "getElementById")
      .mockImplementation(() => null);
    const RootHtml = require("./+html").default;

    expect(() => {
      act(() => {
        TestRenderer.create(
          <RootHtml>
            <main />
          </RootHtml>,
        );
      });
    }).not.toThrow();

    getElementByIdSpy.mockRestore();
  });
});
