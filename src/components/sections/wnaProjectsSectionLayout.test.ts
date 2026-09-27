import { describe, expect, it } from "@jest/globals";
import {
  getProjectCardSpans,
  getProjectColumnCount,
} from "@components/sections/wnaProjectsSectionLayout";

describe("getProjectCardSpans", () => {
  it("widens the last card when the last row ends one column short", () => {
    // 3 columns: [2 1] [1 1 1] [1 1] -> the last row closes with a wide card
    expect(getProjectCardSpans(7, 3, true)).toEqual([2, 1, 1, 1, 1, 1, 2]);
  });

  it("leaves a full last row unchanged", () => {
    expect(getProjectCardSpans(5, 3, true)).toEqual([2, 1, 1, 1, 1]);
  });

  it("leaves a last row that is more than one column short unchanged", () => {
    expect(getProjectCardSpans(6, 3, true)).toEqual([2, 1, 1, 1, 1, 1]);
  });

  it("never widens a card in the featured first row", () => {
    expect(getProjectCardSpans(2, 4, true)).toEqual([2, 1]);
  });

  it("fills single-card rows in a two-column grid", () => {
    // 2 columns: [2] [1 1] [1] -> the last row gets a wide card
    expect(getProjectCardSpans(4, 2, true)).toEqual([2, 1, 1, 2]);
  });

  it("features only the first card while the column count is unknown", () => {
    expect(getProjectCardSpans(7, undefined, true)).toEqual([
      2, 1, 1, 1, 1, 1, 1,
    ]);
  });

  it("keeps every card narrow without a featured first card", () => {
    expect(getProjectCardSpans(4, 3, false)).toEqual([1, 1, 1, 1]);
  });

  it("keeps the layout unchanged in a single column", () => {
    expect(getProjectCardSpans(3, 1, true)).toEqual([2, 1, 1]);
  });
});

describe("getProjectColumnCount", () => {
  it("counts how many cards fit including the gaps between them", () => {
    expect(getProjectColumnCount(800, 256, 16)).toBe(3);
    expect(getProjectColumnCount(799, 256, 16)).toBe(2);
  });

  it("never reports fewer than one column", () => {
    expect(getProjectColumnCount(0, 256, 16)).toBe(1);
  });
});
