import { describe, expect, it, jest } from "@jest/globals";
import WnaProjectsCard from "@components/sections/WnaProjectsCard";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/app-data/testAppData";

jest.mock("@components/text/WnaSectionTitle", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaSectionTitle(props: unknown) {
    return createElement("WnaSectionTitle", props as Record<string, unknown>);
  };
});

jest.mock("@components/cards/WnaCardVerticalWithImage", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaCardVerticalWithImage(props: unknown) {
    return createElement(
      "WnaCardVerticalWithImage",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/buttons/WnaPressable", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaPressable(props: unknown) {
    return createElement(
      "WnaPressable",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/icon/WnaIcon/WnaIcon", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaIcon(props: unknown) {
    return createElement("WnaIcon", props as Record<string, unknown>);
  };
});

describe("WnaProjectsCard", () => {
  it("renders one project card per project entry", () => {
    const appData = {
      ...testAppData,
      projectsSubtitle: "Private work",
      projectsContext: "English project note",
      projects: [
        testAppData.projects[0],
        {
          ...testAppData.projects[0],
          title: "Project 2",
          imageM: "project-2-medium.png",
          imageS: "project-2.png",
        },
      ],
    };

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaProjectsCard
          appColors={
            {
              warmgray6: "#999999",
              coolgray2: "#cccccc",
              accent5: "#0aa",
            } as never
          }
          appData={appData}
          appStyle={{} as never}
          t={((value: string) => value) as never}
        />,
      );
    });

    const title = tree!.root.findByType("WnaSectionTitle");
    const cards = tree!.root.findAllByType("WnaCardVerticalWithImage");
    const texts = tree!.root.findAllByType("Text");
    const textValues = texts.map(
      (node: { props: { children?: React.ReactNode } }) => node.props.children,
    );

    expect(title.props.subtitle).toBe("PRIVATE WORK");
    expect(textValues).toContain("English project note");
    expect(textValues).toContain(testAppData.projectsHighlights[0].text);
    expect(textValues).toContain(testAppData.projectsHighlights[1].text);
    expect(cards).toHaveLength(2);
    expect(cards[0].props.contentMinHeight).toBe(78);
    expect(cards[0].props.height).toBe(128);
    expect(cards[0].props.width).toBe(528);
    expect(cards[1].props.contentMinHeight).toBe(78);
    expect(cards[1].props.height).toBe(128);
    expect(cards[1].props.width).toBe(256);
    expect(cards[0].props.imageUrl).toBe(
      `images/${appData.projects[0].imageM}`,
    );
    expect(cards[1].props.imageUrl).toBe(
      `images/${appData.projects[1].imageS}`,
    );
    expect(cards[1].props.text1).toBe("Project 2");
  });

  it("calls the provided project press handler with the matching index", () => {
    const onProjectPress = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaProjectsCard
          appColors={
            {
              isDark: false,
              warmgray6: "#999999",
              coolgray2: "#cccccc",
              accent5: "#0aa",
            } as never
          }
          appData={testAppData}
          appStyle={{} as never}
          t={((value: string) => value) as never}
          onProjectPress={onProjectPress}
        />,
      );
    });

    const pressables = tree!.root.findAllByType("WnaPressable");

    act(() => {
      pressables[0].props.onPress();
    });

    expect(onProjectPress).toHaveBeenCalledWith(0);
  });

  it("renders a show more action and calls the provided handler", () => {
    const onShowMorePress = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaProjectsCard
          appColors={
            {
              isDark: false,
              warmgray6: "#999999",
              coolgray2: "#cccccc",
              accent5: "#0aa",
            } as never
          }
          appData={testAppData}
          appStyle={{} as never}
          t={((value: string) => value) as never}
          onShowMorePress={onShowMorePress}
        />,
      );
    });

    const texts = tree!.root.findAllByType("Text");
    const textValues = texts.map(
      (node: { props: { children?: React.ReactNode } }) => node.props.children,
    );
    const actionNodes = tree!.root.findAll(
      (node: {
        type: unknown;
        props: {
          onPress?: (() => void) | undefined;
          children?: React.ReactNode;
        };
      }) =>
        typeof node.props.onPress === "function" &&
        node.type !== "WnaPressable" &&
        node.props.children !== undefined,
    );
    const actionNode = actionNodes[actionNodes.length - 1];

    expect(textValues).toContainEqual(["actionShowMore", " →"]);

    act(() => {
      actionNode?.props.onPress();
    });

    expect(onShowMorePress).toHaveBeenCalledTimes(1);
  });

  it("omits optional intro blocks when context and highlights are missing", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaProjectsCard
          appColors={
            {
              isDark: true,
              warmgray6: "#999999",
              coolgray2: "#cccccc",
              accent5: "#0aa",
            } as never
          }
          appData={{
            ...testAppData,
            projectsContext: "",
            projectsHighlights: [],
          }}
          appStyle={{} as never}
          t={((value: string) => value) as never}
        />,
      );
    });

    const texts = tree!.root.findAllByType("Text");
    const textValues = texts.map(
      (node: { props: { children?: React.ReactNode } }) => node.props.children,
    );
    const pressables = tree!.root.findAllByType("WnaPressable");

    expect(textValues).not.toContain(testAppData.projectsContext);
    expect(textValues).not.toContain(testAppData.projectsHighlights[0].text);
    expect(pressables[0].props.ripple).toBe("light");
  });
});
