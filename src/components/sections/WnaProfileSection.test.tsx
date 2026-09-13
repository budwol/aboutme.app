import WnaProfileSection from "@components/sections/WnaProfileSection";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/app-data/testAppData";

jest.mock("@components/text/WnaSectionTitle", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWnaSectionTitle(props: unknown) {
    return ReactModule.createElement(
      "WnaSectionTitle",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/images/WnaImage", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWnaImage(props: unknown) {
    return ReactModule.createElement(
      "WnaImage",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/sections/WnaTechStackSection", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWnaTechStackSection(props: unknown) {
    return ReactModule.createElement(
      "WnaTechStackSection",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/sections/WnaProfileHero", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWnaProfileHero(props: unknown) {
    return ReactModule.createElement(
      "WnaProfileHero",
      props as Record<string, unknown>,
    );
  };
});

describe("WnaProfileSection", () => {
  it("renders the profile text as separate paragraphs from a multiline string", () => {
    const appData = {
      ...testAppData,
      profile: {
        ...testAppData.profile,
        description: "Absatz eins\n\nAbsatz zwei\nAbsatz drei",
      },
    };

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaProfileSection
          appColors={
            {
              white: "#ffffff",
              black: "#000000",
              coolgray2: "#cccccc",
              coolgray8: "#222222",
              warmgray6: "#999999",
              accent5: "#2277ee",
            } as never
          }
          appData={appData}
          appStyle={
            {
              textNeutralMedium: {},
              textExtraLarge: {},
            } as never
          }
          t={((value: string) => value) as never}
        />,
      );
    });

    const hero = tree!.root.findByType("WnaProfileHero");
    const techstack = tree!.root.findByType("WnaTechStackSection");
    const textValues = tree!.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(hero.props.appData).toBe(appData);
    expect(textValues).toEqual(["Absatz eins", "Absatz zwei", "Absatz drei"]);
    expect(techstack.props.appData).toBe(appData);
  });
});
