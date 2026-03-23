import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import WnaNavigationHeaderButtonRight from "@/navigation/components/WnaNavigationHeaderButtonRight";

jest.mock("@/navigation/hooks/useWnaNavigationTransition", () => ({
  useWnaNavigationTransition: (router: {
    push: (...args: unknown[]) => void;
  }) => ({
    push: (...args: unknown[]) => router.push(...args),
  }),
}));

jest.mock("@components/buttons/WnaButtonHeader", () => {
  const React = jest.requireActual("react") as typeof import("react");
  const { Pressable, Text } = jest.requireActual(
    "react-native",
  ) as typeof import("react-native");

  return function MockWnaButtonHeader(
    props: Readonly<{ text?: string; onPress: () => void }>,
  ) {
    return (
      <Pressable onPress={props.onPress}>
        <Text>{props.text ?? "button"}</Text>
      </Pressable>
    );
  };
});

describe("WnaNavigationHeaderButtonRight RNTL", () => {
  it("pushes the resolved route when the header button is pressed", () => {
    const router = {
      push: jest.fn(),
    };

    render(
      <WnaNavigationHeaderButtonRight
        appColors={{ isDark: false } as never}
        appStyle={{} as never}
        t={((value: string) => value) as never}
        router={router as never}
        route="projects"
      />,
    );

    fireEvent.press(screen.getByText("screenTitleProjects"));

    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith("/projects");
  });
});
