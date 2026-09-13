import { describe, expect, it } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { ScrollView } from "react-native";
import WnaNavigationList, {
  WnaMenuItem,
} from "@/navigation/components/WnaNavigationList";

describe("WnaNavigationList", () => {
  it("renders menu items and separators in a web-compatible scroll view", () => {
    const items: WnaMenuItem[] = [
      { route: "/one", text: "One", type: "nav" },
      { text: "Two", type: "secondary" },
    ];
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaNavigationList
          appStyle={{ containerCenterMaxWidth: { maxWidth: 960 } } as never}
          appLayout={
            {
              contentListPaddingTop: 12,
              contentPaddingBottom: 24,
              globalListGap: 8,
              scrollEventThrottle: 16,
            } as never
          }
          items={items}
          overrideGap={10}
          overridePaddingTop={6}
          style={{ backgroundColor: "#fff" }}
          renderItem={(item) =>
            React.createElement("RenderedItem", { text: item.text })
          }
        />,
      );
    });

    const list = tree!.root.findByType(ScrollView);

    expect(list.props.scrollEventThrottle).toBe(16);
    expect(list.props.style).toEqual([
      { paddingTop: 6, paddingBottom: 24 },
      { backgroundColor: "#fff" },
    ]);
    const children = list.props.children;
    expect(children).toHaveLength(2);
    expect(children[0].key).toBe("/one");
    expect(children[1].key).toBe("Two-1");
    expect(children[0].props.children[0].props.style).toEqual({
      maxWidth: 960,
    });
    expect(children[0].props.children[0].props.children.props.text).toBe("One");
    expect(children[1].props.children[0].props.children.props.text).toBe("Two");
    expect(children[0].props.children[1].props.style).toEqual([
      expect.objectContaining({ width: "100%" }),
      { height: 10 },
    ]);
    expect(children[1].props.children[1]).toBeNull();
  });

  it("falls back to layout defaults when no overrides or style are given", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaNavigationList
          appStyle={{ containerCenterMaxWidth: {} } as never}
          appLayout={
            {
              contentListPaddingTop: 12,
              contentPaddingBottom: 24,
              globalListGap: 8,
              scrollEventThrottle: 16,
            } as never
          }
          items={[]}
          renderItem={() => null}
        />,
      );
    });

    const list = tree!.root.findByType(ScrollView);

    expect(list.props.style).toEqual([
      { paddingTop: 12, paddingBottom: 24 },
      null,
    ]);
    expect(list.props.children).toEqual([]);
  });
});
