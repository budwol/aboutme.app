import { describe, expect, it } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { FlatList } from "react-native";
import WnaNavigationList from "@/navigation/components/WnaNavigationList";

describe("WnaNavigationList", () => {
  it("passes list props and helpers to FlatList", () => {
    const items = [
      { route: "/one", text: "One", type: "primary" },
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

    const list = tree!.root.findByType(FlatList);

    expect(list.props.data).toBe(items);
    expect(list.props.extraData).toBe(items);
    expect(list.props.scrollEventThrottle).toBe(16);
    expect(list.props.style).toEqual([
      { paddingTop: 6, paddingBottom: 24 },
      { backgroundColor: "#fff" },
    ]);
    expect(list.props.keyExtractor(items[0], 0)).toBe("/one");
    expect(list.props.keyExtractor(items[1], 1)).toBe("Two-1");

    const rendered = list.props.renderItem({ item: items[0] });
    const separator = list.props.ItemSeparatorComponent();

    expect(rendered.props.style).toEqual({ maxWidth: 960 });
    expect(rendered.props.children.props.text).toBe("One");
    expect(separator.props.style).toEqual([
      expect.objectContaining({ width: "100%" }),
      { height: 10 },
    ]);
    expect(list.props.renderItem({ item: undefined })).toBeNull();
  });
});
