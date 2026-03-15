import { DEFAULT_APP_DATA } from "@/app-data";
import { describe, expect, it, jest } from "@jest/globals";
import WnaExperienceCard from "@components/welcome/WnaExperienceCard";
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

jest.mock("@components/cards/WnaCardSmallVertical", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaCardSmallVertical(props: unknown) {
    return createElement(
      "WnaCardSmallVertical",
      props as Record<string, unknown>,
    );
  };
});

describe("WnaExperienceCard", () => {
  it("renders one timeline card per experience entry", () => {
    const appData = {
      ...DEFAULT_APP_DATA,
      experienceSubtitle: "Career path",
      experience: [
        ...DEFAULT_APP_DATA.experience,
        {
          ...DEFAULT_APP_DATA.experience[0],
          period: "2016-2020",
          role: "Senior Engineer",
        },
      ],
    };

    const appStyle = {
      textNeutralSmall: {},
    } as never;

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceCard
          appColors={{ accent5: "#0aa", coolgray6: "#666" } as never}
          appData={appData}
          appStyle={appStyle}
          t={((value: string) => value) as never}
        />,
      );
    });

    const title = tree!.root.findByType("WnaWelcomeTitle");
    const cards = tree!.root.findAllByType("WnaCardSmallVertical");

    expect(title.props.subtitle).toBe("CAREER PATH");
    expect(cards).toHaveLength(2);
    expect(cards[0].props.title).toBe(appData.experience[0].role);
    expect(cards[1].props.title).toBe("Senior Engineer");
  });
});
