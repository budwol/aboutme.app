import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import WnaButtonTextDecent from "@components/buttons/WnaButtonTextDecent";

describe("WnaButtonTextDecent", () => {
  it("renders the text and triggers onPress", () => {
    const onPress = jest.fn();

    render(
      <WnaButtonTextDecent
        appColors={{ black: "#000" } as never}
        text="Open"
        onPress={onPress}
        t={((value: string) => value) as never}
        checkInternetConnection={false}
      />,
    );

    fireEvent.press(screen.getByText("Open"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
