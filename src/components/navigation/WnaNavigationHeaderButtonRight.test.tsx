import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaNavigationHeaderButtonRight from "@components/navigation/WnaNavigationHeaderButtonRight";

jest.mock("@components/navigation/useWnaNavigationTransition", () => ({
  useWnaNavigationTransition: (router: {
    push: (...args: unknown[]) => void;
  }) => ({
    push: (...args: unknown[]) => router.push(...args),
  }),
}));

jest.mock("@components/buttons/WnaButtonHeader", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaButtonHeader(props: unknown) {
    return createElement("WnaButtonHeader", props as Record<string, unknown>);
  };
});

describe("WnaNavigationHeaderButtonRight", () => {
  it("updates button config when the route prop changes", () => {
    const router = { push: () => {} };
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaNavigationHeaderButtonRight
          appColors={{ isDark: false } as never}
          appStyle={{} as never}
          t={((value: string) => value) as never}
          router={router as never}
          route="projects"
        />,
      );
    });

    act(() => {
      tree!.update(
        <WnaNavigationHeaderButtonRight
          appColors={{ isDark: false } as never}
          appStyle={{} as never}
          t={((value: string) => value) as never}
          router={router as never}
          route="experience"
        />,
      );
    });

    const buttonHeader = tree!.root.findByType("WnaButtonHeader");

    expect(buttonHeader.props.text).toBe("screenTitleExperience");
    expect(buttonHeader.props.iconName).toBe("walk");
  });

  it("uses translated labels for the configured route", () => {
    const router = { push: () => {} };
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaNavigationHeaderButtonRight
          appColors={{ isDark: false } as never}
          appStyle={{} as never}
          t={((value: string) => `tx:${value}`) as never}
          router={router as never}
          route="home"
        />,
      );
    });

    const buttonHeader = tree!.root.findByType("WnaButtonHeader");

    expect(buttonHeader.props.text).toBe("tx:screenTitleStartPage");
  });
});
