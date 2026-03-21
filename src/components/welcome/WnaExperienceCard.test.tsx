import { defaultAppData } from "@/app-data";
import { describe, expect, it, jest } from "@jest/globals";
import WnaExperienceCard from "@components/welcome/WnaExperienceCard";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

type RenderedTextNode = {
  props: {
    children?: unknown;
  };
};

type PressableNode = {
  props: {
    onPress?: () => void;
  };
};

type BadgeNode = {
  props: {
    text?: string;
  };
};

function flattenText(children: unknown): string {
  if (Array.isArray(children)) {
    return children.map((child) => flattenText(child)).join("");
  }

  return typeof children === "string" ? children : "";
}

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

jest.mock("@components/misc/WnaBadge", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaBadge(props: unknown) {
    return createElement("WnaBadge", props as Record<string, unknown>);
  };
});

describe("WnaExperienceCard", () => {
  it("renders one timeline card per experience entry", () => {
    const appData = {
      ...defaultAppData,
      experienceSubtitle: "Career path",
      experience: [
        ...defaultAppData.experience,
        {
          ...defaultAppData.experience[0],
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
    expect(cards[0].props.badgeText).toBe(appData.experience[0].duration);
    expect(cards[1].props.title).toBe("Senior Engineer");
  });

  it("uses ellipsis when an experience duration is empty", () => {
    const appData = {
      ...defaultAppData,
      experience: [
        {
          ...defaultAppData.experience[0],
          duration: "",
        },
      ],
    };

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceCard
          appColors={{ accent5: "#0aa", coolgray6: "#666" } as never}
          appData={appData}
          appStyle={{ textNeutralSmall: {} } as never}
          t={((value: string) => value) as never}
        />,
      );
    });

    const card = tree!.root.findByType("WnaCardSmallVertical");

    expect(card.props.badgeText).toBe("...");
  });

  it("renders a details toggle when an experience has extra content", () => {
    const appData = {
      ...defaultAppData,
      experience: [
        {
          ...defaultAppData.experience[0],
          details: ["Built the thing"],
          techstack: ["C#", ".NET"],
        },
      ],
    };

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceCard
          appColors={{ accent5: "#0aa", coolgray6: "#666" } as never}
          appData={appData}
          appStyle={
            {
              textNeutralSmall: {},
              textMicro: {},
              textNeutralMicro: {},
            } as never
          }
          t={((value: string) => value) as never}
        />,
      );
    });

    const toggle = tree!.root
      .findAllByType("Text")
      .find((node: RenderedTextNode) =>
        flattenText(node.props.children).includes("actionShowDetails"),
      );

    expect(toggle).toBeDefined();
  });

  it("expands details and tech badges when the toggle is pressed", () => {
    const appData = {
      ...defaultAppData,
      experience: [
        {
          ...defaultAppData.experience[0],
          details: ["Built the thing", "Improved the tests"],
          techstack: ["C#", ".NET"],
        },
      ],
    };

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceCard
          appColors={
            {
              accent5: "#0aa",
              coolgray1: "#fafafa",
              coolgray2: "#ddd",
              coolgray6: "#666",
              warmgray6: "#444",
              coolgray8: "#111",
              white: "#fff",
            } as never
          }
          appData={appData}
          appStyle={
            {
              textNeutralSmall: {},
              textMicro: {},
              textNeutralMicro: {},
            } as never
          }
          t={((value: string) => value) as never}
        />,
      );
    });

    const toggleButton = tree!.root.find(
      (node: PressableNode) => typeof node.props.onPress === "function",
    );

    act(() => {
      toggleButton.props.onPress();
    });

    const textValues = tree!.root
      .findAllByType("Text")
      .map((node: RenderedTextNode) => flattenText(node.props.children));
    const badges = tree!.root.findAllByType("WnaBadge");

    expect(textValues).toContain("Built the thing");
    expect(textValues).toContain("Improved the tests");
    expect(textValues).toContain("titleProjectTechstack");
    expect(badges.map((badge: BadgeNode) => badge.props.text)).toEqual([
      "C#",
      ".NET",
    ]);
  });
});
