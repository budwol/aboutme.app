import { describe, expect, it, jest } from "@jest/globals";
import WnaExperienceCard from "@components/welcome/WnaExperienceCard";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/test/testAppData";

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

type CardNode = {
  props: {
    title?: string;
    subtitle?: string;
    description?: string;
    badgeText?: string;
    onPress?: () => void;
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
      (props as { footerContent?: React.ReactNode }).footerContent,
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

jest.mock("react-native-reanimated", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return {
    __esModule: true,
    default: {
      View: (props: unknown) =>
        ReactModule.createElement(
          "AnimatedView",
          props as Record<string, unknown>,
          (props as { children?: React.ReactNode }).children,
        ),
    },
    useAnimatedStyle: (factory: () => unknown) => factory(),
    useSharedValue: (value: unknown) => ({ value }),
    withTiming: (value: unknown) => value,
  };
});

describe("WnaExperienceCard", () => {
  it("renders one timeline card per experience entry", () => {
    const appData = {
      ...testAppData,
      experienceSubtitle: "Career path",
      experience: [
        testAppData.experience[0],
        {
          ...testAppData.experience[0],
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
          appColors={
            {
              accent5: "#0aa",
              coolgray1: "#fafafa",
              coolgray2: "#ddd",
              coolgray6: "#666",
            } as never
          }
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
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
          duration: "",
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
            } as never
          }
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
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
          details: ["Built the thing"],
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

    const toggle = tree!.root
      .findAllByType("Text")
      .find((node: RenderedTextNode) =>
        flattenText(node.props.children).includes("actionShowDetails"),
      );

    expect(toggle).toBeDefined();
  });

  it("renders a details toggle when an experience only has a description", () => {
    const appData = {
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
          details: [],
          techstack: [],
          description: "Project development in the e-government domain",
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

    const toggle = tree!.root
      .findAllByType("Text")
      .find((node: RenderedTextNode) =>
        flattenText(node.props.children).includes("actionShowDetails"),
      );

    expect(toggle).toBeDefined();
  });

  it("renders a details toggle even when an experience has no extra detail content", () => {
    const appData = {
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
          details: [],
          techstack: [],
          description: "",
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

    const toggle = tree!.root
      .findAllByType("Text")
      .find((node: RenderedTextNode) =>
        flattenText(node.props.children).includes("actionShowDetails"),
      );

    expect(toggle).toBeDefined();
  });

  it("expands details and tech badges when the toggle is pressed", () => {
    const description = "High-level summary";
    const appData = {
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
          description,
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

    const card = tree!.root.findByType("WnaCardSmallVertical");

    act(() => {
      card.props.onPress?.();
    });

    const textValues = tree!.root
      .findAllByType("Text")
      .map((node: RenderedTextNode) => flattenText(node.props.children));
    const badges = tree!.root.findAllByType("WnaBadge");
    const cards = tree!.root.findAllByType("WnaCardSmallVertical");

    expect(textValues).toContain("Built the thing");
    expect(textValues).toContain("Improved the tests");
    expect(textValues).toContain("titleProjectTechstack");
    expect(cards[0].props.description).toBe(description);
    expect(
      textValues.filter((value: string) => value === description),
    ).toHaveLength(0);
    expect(badges.map((badge: BadgeNode) => badge.props.text)).toEqual([
      "C#",
      ".NET",
    ]);
  });

  it("expands details when the experience card itself is pressed", () => {
    const appData = {
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
          details: ["Built the thing"],
          techstack: ["C#"],
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
              textNeutralLabel: {},
            } as never
          }
          t={((value: string) => value) as never}
        />,
      );
    });

    const card = tree!.root.findByType("WnaCardSmallVertical");

    act(() => {
      card.props.onPress?.();
    });

    const textValues = tree!.root
      .findAllByType("Text")
      .map((node: RenderedTextNode) => flattenText(node.props.children));

    expect(textValues).toContain("Built the thing");
    expect(textValues).toContain("titleProjectTechstack");
    expect(textValues).toContain("actionHideDetails ↑");
  });

  it("expands the description when no dedicated detail list exists", () => {
    const description = "Project development in the e-government domain";
    const appData = {
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
          details: [],
          techstack: [],
          description,
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

    const card = tree!.root.findByType("WnaCardSmallVertical");

    act(() => {
      card.props.onPress?.();
    });

    const textValues = tree!.root
      .findAllByType("Text")
      .map((node: RenderedTextNode) => flattenText(node.props.children));

    expect(textValues).toContain(description);
    expect(textValues).toContain("actionHideDetails ↑");
  });

  it("can render the detail view with all experience details open by default", () => {
    const appData = {
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
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
              textNeutralLabel: {},
            } as never
          }
          t={((value: string) => value) as never}
          expandAllDetailsByDefault
        />,
      );
    });

    const textValues = tree!.root
      .findAllByType("Text")
      .map((node: RenderedTextNode) => flattenText(node.props.children));
    const badges = tree!.root.findAllByType("WnaBadge");

    expect(textValues).toContain("Built the thing");
    expect(textValues).toContain("Improved the tests");
    expect(textValues).toContain("titleProjectTechstack");
    expect(textValues).toContain("actionHideDetails ↑");
    expect(badges.map((badge: BadgeNode) => badge.props.text)).toEqual([
      "C#",
      ".NET",
    ]);
  });

  it("can render a reduced home teaser with a footer action", () => {
    const onFooterActionPress = jest.fn();
    const appData = {
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
          role: "Role A",
        },
        {
          ...testAppData.experience[0],
          role: "Role B",
        },
        {
          ...testAppData.experience[0],
          role: "Role C",
        },
        {
          ...testAppData.experience[0],
          role: "Role D",
        },
        {
          ...testAppData.experience[0],
          role: "Role E",
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
          maxItems={4}
          showDetails={false}
          footerActionLabel="actionShowMore"
          onFooterActionPress={onFooterActionPress}
        />,
      );
    });

    const cards = tree!.root.findAllByType("WnaCardSmallVertical");
    const textValues = tree!.root
      .findAllByType("Text")
      .map((node: RenderedTextNode) => flattenText(node.props.children));
    const pressable = tree!.root.find(
      (node: PressableNode) => typeof node.props.onPress === "function",
    );

    act(() => {
      pressable.props.onPress?.();
    });

    expect(cards).toHaveLength(4);
    expect(cards.map((card: CardNode) => card.props.title)).toEqual([
      "Role A",
      "Role B",
      "Role C",
      "Role D",
    ]);
    expect(textValues).toContain("actionShowMore →");
    expect(textValues).not.toContain("actionShowDetails ↓");
    expect(onFooterActionPress).toHaveBeenCalledTimes(1);
  });

  it("renders each teaser experience entry exactly once and preserves order", () => {
    const appData = {
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
          period: "since 05/2024",
          role: "Software Engineer",
          company: "Cool Company Ltd.",
          description: "Current platform work",
          duration: "1 yr 11 mos",
        },
        {
          ...testAppData.experience[0],
          period: "09/2020 - 04/2024",
          role: "Software Engineer",
          company: "Rocket Science Ltd.",
          description: "Offline-first mobile apps",
          duration: "3 yrs 8 mos",
        },
        {
          ...testAppData.experience[0],
          period: "06/2020 - 08/2020",
          role: "IT Team Lead (Interim)",
          company: "Code Fabric Ltd.",
          description: "Interim team leadership",
          duration: "3 mos",
        },
        {
          ...testAppData.experience[0],
          period: "02/2020 - 08/2020",
          role: "ERP Project Manager",
          company: "Cool Company Ltd.",
          description: "ERP tender preparation",
          duration: "7 mos",
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
          maxItems={4}
          showDetails={false}
        />,
      );
    });

    const cards = tree!.root.findAllByType("WnaCardSmallVertical");

    expect(cards).toHaveLength(4);
    expect(
      cards.map((card: CardNode) => ({
        title: card.props.title,
        subtitle: card.props.subtitle,
        description: card.props.description,
        badgeText: card.props.badgeText,
      })),
    ).toEqual([
      {
        title: "Software Engineer",
        subtitle: "Cool Company Ltd.",
        description: "Current platform work",
        badgeText: "1 yr 11 mos",
      },
      {
        title: "Software Engineer",
        subtitle: "Rocket Science Ltd.",
        description: "Offline-first mobile apps",
        badgeText: "3 yrs 8 mos",
      },
      {
        title: "IT Team Lead (Interim)",
        subtitle: "Code Fabric Ltd.",
        description: "Interim team leadership",
        badgeText: "3 mos",
      },
      {
        title: "ERP Project Manager",
        subtitle: "Cool Company Ltd.",
        description: "ERP tender preparation",
        badgeText: "7 mos",
      },
    ]);
  });
});
