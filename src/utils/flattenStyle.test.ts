import { describe, expect, it } from "@jest/globals";
import { CSSProperties } from "react";
import { flattenStyle } from "@utils/flattenStyle";

describe("flattenStyle", () => {
  it("returns an empty object for null, undefined and false", () => {
    expect(flattenStyle(null)).toEqual({});
    expect(flattenStyle(undefined)).toEqual({});
    expect(flattenStyle(false)).toEqual({});
  });

  it("returns a single style object unchanged", () => {
    expect(flattenStyle({ color: "red", padding: 4 })).toEqual({
      color: "red",
      padding: 4,
    });
  });

  it("merges an array of styles left-to-right, later entries winning", () => {
    expect(
      flattenStyle([{ color: "red", padding: 4 }, { color: "blue" }]),
    ).toEqual({ color: "blue", padding: 4 });
  });

  it("skips falsy entries inside an array", () => {
    expect(
      flattenStyle([{ color: "red" }, null, undefined, false, { padding: 8 }]),
    ).toEqual({ color: "red", padding: 8 });
  });

  it("flattens arbitrarily nested arrays", () => {
    expect(
      flattenStyle<CSSProperties>([
        { color: "red" },
        [{ padding: 4 }, [{ margin: 2 }, { color: "green" }]],
      ]),
    ).toEqual({ color: "green", padding: 4, margin: 2 });
  });

  it("supports a narrower, non-CSSProperties style type", () => {
    type CustomStyle = { width?: number; boxSizing?: "border-box" };

    expect(
      flattenStyle<CustomStyle>([{ width: 10 }, { boxSizing: "border-box" }]),
    ).toEqual({ width: 10, boxSizing: "border-box" });
  });
});
