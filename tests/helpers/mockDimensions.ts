import { jest } from "@jest/globals";
import { Dimensions, ScaledSize } from "react-native";

function createScaledSize(width: number, height: number): ScaledSize {
  return {
    width,
    height,
    scale: 1,
    fontScale: 1,
  };
}

export function mockDimensions(width: number, height: number) {
  return jest
    .spyOn(Dimensions, "get")
    .mockImplementation(() => createScaledSize(width, height));
}
