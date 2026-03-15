import { DEFAULT_APP_DATA } from "@/app-data";
import { describe, expect, it, jest } from "@jest/globals";
import WnaProjectsCard from "@components/welcome/WnaProjectsCard";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

jest.mock("@components/text/WnaWelcomeTitle", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaWelcomeTitle(props: unknown) {
    return createElement("WnaWelcomeTitle", props as Record<string, unknown>);
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

describe("WnaProjectsCard", () => {
  it("renders one project card per project entry", () => {
    const appData = {
      ...DEFAULT_APP_DATA,
      projectsSubtitle: "Private work",
      projects: [
        ...DEFAULT_APP_DATA.projects,
        {
          ...DEFAULT_APP_DATA.projects[0],
          title: "Project 2",
          imageS: "project-2.png",
        },
      ],
    };

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaProjectsCard
          appColors={{} as never}
          appData={appData}
          appStyle={{} as never}
          t={((value: string) => value) as never}
        />,
      );
    });

    const title = tree!.root.findByType("WnaWelcomeTitle");
    const cards = tree!.root.findAllByType("WnaCardVerticalWithImage");

    expect(title.props.subtitle).toBe("PRIVATE WORK");
    expect(cards).toHaveLength(2);
    expect(cards[0].props.imageUrl).toBe(
      `images/${appData.projects[0].imageS}`,
    );
    expect(cards[1].props.text1).toBe("Project 2");
  });
});
