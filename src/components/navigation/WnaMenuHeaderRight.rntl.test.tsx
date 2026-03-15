import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { DrawerActions } from "@react-navigation/native";
import React from "react";
import WnaMenuHeaderRight from "@components/navigation/WnaMenuHeaderRight";

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

describe("WnaMenuHeaderRight RNTL", () => {
  it("dispatches the drawer open action when pressed", () => {
    const navigation = {
      dispatch: jest.fn(),
    };

    render(
      <WnaMenuHeaderRight
        appColors={{ isDark: false } as never}
        appStyle={{} as never}
        navigation={navigation}
        t={(() => "Menu") as never}
      />,
    );

    fireEvent.press(screen.getByText("Menu"));

    expect(navigation.dispatch).toHaveBeenCalledTimes(1);
    expect(navigation.dispatch).toHaveBeenCalledWith(
      DrawerActions.openDrawer(),
    );
  });
});
