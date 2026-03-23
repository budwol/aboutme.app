import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import WnaButtonText from "@components/buttons/WnaButtonText";

describe("WnaButtonText", () => {
  it("renders the label and fires onPress", () => {
    const onPress = jest.fn();

    render(
      <WnaButtonText
        appColors={
          { staticWhite: "#fff", coolgray4: "#888", coolgray2: "#222" } as never
        }
        appStyle={{ textNeutralMedium: {} } as never}
        text="Save"
        onPress={onPress}
        t={((value: string) => value) as never}
        checkInternetConnection={false}
      />,
    );

    fireEvent.press(screen.getByText("Save"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
