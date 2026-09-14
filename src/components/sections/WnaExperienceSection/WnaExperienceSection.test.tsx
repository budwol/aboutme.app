import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import WnaExperienceSection from "@components/sections/WnaExperienceSection";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/app-data/testAppData";
import {
  detailsHeightBuffer,
  detailsTopSpacing,
} from "@components/sections/WnaExperienceSection/wnaExperienceSectionStyles";

type RenderedTextNode = {
  props: {
    children?: unknown;
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
    subtitleContent?: React.ReactNode;
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

type ResizeObserverCallback = (
  entries: { contentRect: { height: number } }[],
) => void;

let resizeObserverCallback: ResizeObserverCallback | undefined;

class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeObserverCallback = callback;
  }
  observe() {}
  disconnect() {}
}

function emitResizeHeight(height: number) {
  resizeObserverCallback?.([{ contentRect: { height } }]);
}

jest.mock("@components/text/WnaSectionTitle", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaSectionTitle(props: unknown) {
    return createElement("WnaSectionTitle", props as Record<string, unknown>);
  };
});

jest.mock("@components/cards/WnaCardVerticalSmall", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaCardVerticalSmall(props: unknown) {
    return createElement(
      "WnaCardVerticalSmall",
      props as Record<string, unknown>,
      (props as { subtitleContent?: React.ReactNode }).subtitleContent,
      (props as { footerContent?: React.ReactNode }).footerContent,
    );
  };
});

jest.mock("@components/display/WnaBadge", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaBadge(props: unknown) {
    return createElement("WnaBadge", props as Record<string, unknown>);
  };
});

describe("WnaExperienceSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resizeObserverCallback = undefined;
    (global as { ResizeObserver?: unknown }).ResizeObserver =
      MockResizeObserver;
  });

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
        <WnaExperienceSection
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

    const title = tree!.root.findByType("WnaSectionTitle");
    const cards = tree!.root.findAllByType("WnaCardVerticalSmall");

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
        <WnaExperienceSection
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

    const card = tree!.root.findByType("WnaCardVerticalSmall");

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
        <WnaExperienceSection
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
      .findAllByType("span")
      .find((node: RenderedTextNode) =>
        flattenText(node.props.children).includes("actionShowDetails"),
      );

    expect(toggle).toBeDefined();
  });

  it("renders the company as a subtle link and opens the employer URL", async () => {
    const appData = {
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
          company: "Linked Employer",
          companyUrl: "https://linked-employer.example.com",
        },
      ],
    };

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(
        <WnaExperienceSection
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
              textNeutralMicro: {},
              textMicro: {},
            } as never
          }
          t={((value: string) => value) as never}
        />,
      );
    });

    const companyLink = tree!.root.findByProps({
      "data-testid": "experience-company-link-0",
    });
    const linkText = companyLink.findByType("span");

    expect(companyLink.props.href).toBe("https://linked-employer.example.com");
    expect(companyLink.props.target).toBe("_blank");
    expect(companyLink.props.rel).toBe("noreferrer");
    expect(companyLink.props["aria-label"]).toBe("Linked Employer");
    expect(companyLink.props.style).toEqual(
      expect.objectContaining({
        color: "inherit",
        cursor: "pointer",
        display: "block",
        textDecoration: "none",
      }),
    );
    expect(typeof companyLink.props.onMouseEnter).toBe("function");
    expect(typeof companyLink.props.onMouseLeave).toBe("function");
    expect(flattenText(linkText.props.children)).toBe("Linked Employer");

    act(() => {
      companyLink.props.onMouseEnter();
    });

    const hoveredLink = tree!.root.findByProps({
      "data-testid": "experience-company-link-0",
    });
    const hoveredStyle = hoveredLink.props.style as Record<string, unknown>;

    expect(hoveredStyle.backgroundColor).toEqual(expect.any(String));

    act(() => {
      companyLink.props.onMouseLeave();
    });

    const unhoveredLink = tree!.root.findByProps({
      "data-testid": "experience-company-link-0",
    });

    expect(unhoveredLink.props.style.backgroundColor).toBeUndefined();

    const stopPropagation = jest.fn();
    act(() => {
      companyLink.props.onClick({ stopPropagation } as never);
    });

    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });

  it("renders a plain company subtitle when no employer URL is provided", () => {
    const appData = {
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
          company: "Plain Employer",
          companyUrl: undefined,
        },
      ],
    };

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceSection
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
              textNeutralMicro: {},
              textMicro: {},
            } as never
          }
          t={((value: string) => value) as never}
        />,
      );
    });

    const card = tree!.root.findByType("WnaCardVerticalSmall");

    expect(card.props.subtitle).toBe("Plain Employer");
    expect(card.props.subtitleContent).toBeUndefined();
    expect(
      tree!.root.findAllByProps({
        "data-testid": "experience-company-link-0",
      }),
    ).toHaveLength(0);
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
        <WnaExperienceSection
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
      .findAllByType("span")
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
        <WnaExperienceSection
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
      .findAllByType("span")
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
        <WnaExperienceSection
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

    const card = tree!.root.findByType("WnaCardVerticalSmall");

    act(() => {
      card.props.onPress?.();
    });

    const textValues = tree!.root
      .findAllByType("span")
      .map((node: RenderedTextNode) => flattenText(node.props.children));
    const badges = tree!.root.findAllByType("WnaBadge");
    const cards = tree!.root.findAllByType("WnaCardVerticalSmall");

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
        <WnaExperienceSection
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

    const card = tree!.root.findByType("WnaCardVerticalSmall");

    act(() => {
      card.props.onPress?.();
    });

    const textValues = tree!.root
      .findAllByType("span")
      .map((node: RenderedTextNode) => flattenText(node.props.children));

    expect(textValues).toContain("Built the thing");
    expect(textValues).toContain("titleProjectTechstack");
    expect(textValues).toContain("actionHideDetails ↑");
  });

  it("collapses the details again when the experience card is pressed twice", () => {
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
        <WnaExperienceSection
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

    const card = tree!.root.findByType("WnaCardVerticalSmall");

    act(() => {
      card.props.onPress?.();
    });

    act(() => {
      card.props.onPress?.();
    });

    const textValues = tree!.root
      .findAllByType("span")
      .map((node: RenderedTextNode) => flattenText(node.props.children));
    const detailsClip = tree!.root.find(
      (node: { props: { id?: string } }) =>
        node.props.id?.startsWith("wna-experience-details-") === true,
    );
    const detailsClipStyle = Array.isArray(detailsClip.props.style)
      ? detailsClip.props.style
      : [detailsClip.props.style];

    expect(textValues).toContain("actionShowDetails ↓");
    expect(
      detailsClipStyle.some(
        (entry: { height?: number } | undefined) => entry?.height === 0,
      ),
    ).toBe(true);
  });

  it("uses the compact timeline layout on narrow screens", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RN = require("react-native") as typeof import("react-native");
    const useWindowDimensionsSpy = jest
      .spyOn(RN, "useWindowDimensions")
      .mockReturnValue({ width: 480, height: 900, scale: 1, fontScale: 1 });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceSection
          appColors={
            {
              accent5: "#0aa",
              coolgray1: "#fafafa",
              coolgray2: "#ddd",
              coolgray6: "#666",
            } as never
          }
          appData={testAppData}
          appStyle={{ textNeutralSmall: {}, textMicro: {} } as never}
          t={((value: string) => value) as never}
        />,
      );
    });

    const timelineWrapper = tree!.root
      .findAllByType("div")
      .find(
        (node: { props: { style?: { width?: string } } }) =>
          node.props.style?.width === "100%",
      );
    const textValues = tree!.root
      .findAllByType("span")
      .map((node: RenderedTextNode) => flattenText(node.props.children));
    const periodColumns = tree!.root.findAll(
      (node: { props: { style?: { lineHeight?: string } } }) =>
        node.props.style?.lineHeight === "18px",
    );

    expect(timelineWrapper).toBeDefined();
    expect(textValues).toContain(testAppData.experience[0].period);
    expect(periodColumns.length).toBeGreaterThan(0);

    useWindowDimensionsSpy.mockRestore();
  });

  it("updates the detail box height when the content layout is measured", () => {
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
        <WnaExperienceSection
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
        { createNodeMock: () => ({}) },
      );
    });

    const findDetailsClip = () =>
      tree!.root.find(
        (node: { props: { id?: string } }) =>
          node.props.id?.startsWith("wna-experience-details-") === true,
      );

    act(() => {
      emitResizeHeight(48);
    });

    expect((findDetailsClip().props.style as { height?: number }).height).toBe(
      48 + detailsTopSpacing + detailsHeightBuffer,
    );

    act(() => {
      emitResizeHeight(48);
    });

    expect((findDetailsClip().props.style as { height?: number }).height).toBe(
      48 + detailsTopSpacing + detailsHeightBuffer,
    );

    act(() => {
      tree!.unmount();
    });
  });

  it("does not measure the details height when ResizeObserver is unavailable", () => {
    const originalResizeObserver = (global as { ResizeObserver?: unknown })
      .ResizeObserver;
    delete (global as { ResizeObserver?: unknown }).ResizeObserver;

    const appData = {
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
          details: ["Built the thing"],
        },
      ],
    };

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceSection
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
        { createNodeMock: () => ({}) },
      );
    });

    const detailsClip = tree!.root.find(
      (node: { props: { id?: string } }) =>
        node.props.id?.startsWith("wna-experience-details-") === true,
    );

    expect((detailsClip.props.style as { height?: number }).height).toBe(
      detailsTopSpacing + detailsHeightBuffer,
    );

    (global as { ResizeObserver?: unknown }).ResizeObserver =
      originalResizeObserver;
  });

  it("falls back to an empty subtitle when experienceSubtitle is missing", () => {
    const appData = {
      ...testAppData,
      experienceSubtitle: undefined,
    };

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceSection
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

    const title = tree!.root.findByType("WnaSectionTitle");

    expect(title.props.subtitle).toBe("");
  });

  it("defaults the card opacity to 1 when an experience entry has none", () => {
    const appData = {
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
          opacity: undefined,
        },
      ],
    };

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceSection
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

    const card = tree!.root.findByType("WnaCardVerticalSmall");

    expect(card.props.opacity).toBe(1);
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
        <WnaExperienceSection
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

    const card = tree!.root.findByType("WnaCardVerticalSmall");

    act(() => {
      card.props.onPress?.();
    });

    const textValues = tree!.root
      .findAllByType("span")
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
        <WnaExperienceSection
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
      .findAllByType("span")
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
        <WnaExperienceSection
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

    const cards = tree!.root.findAllByType("WnaCardVerticalSmall");
    const textValues = tree!.root
      .findAllByType("span")
      .map((node: RenderedTextNode) => flattenText(node.props.children));
    const footerAction = tree!.root.find(
      (node: {
        type: unknown;
        props: {
          onClick?: () => void;
        };
      }) => node.type === "button" && typeof node.props.onClick === "function",
    );

    act(() => {
      footerAction.props.onClick?.();
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

  it("keeps the footer action flow intact when hoverable company links exist", () => {
    const onFooterActionPress = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceSection
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
          appData={testAppData}
          appStyle={
            {
              textNeutralSmall: {},
              textMicro: {},
              textNeutralMicro: {},
            } as never
          }
          t={((value: string) => value) as never}
          maxItems={1}
          showDetails={false}
          footerActionLabel="actionShowMore"
          onFooterActionPress={onFooterActionPress}
        />,
      );
    });

    const footerAction = tree!.root.find(
      (node: {
        type: unknown;
        props: {
          onClick?: () => void;
        };
      }) => node.type === "button" && typeof node.props.onClick === "function",
    );

    act(() => {
      footerAction.props.onClick?.();
    });

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
        <WnaExperienceSection
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

    const cards = tree!.root.findAllByType("WnaCardVerticalSmall");

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
