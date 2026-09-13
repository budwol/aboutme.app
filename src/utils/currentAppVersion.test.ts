import { describe, expect, it } from "@jest/globals";
import packageJson from "../../package.json";
import currentAppVersion from "@utils/currentAppVersion";

describe("currentAppVersion", () => {
  it("uses package.json as the single web version source", () => {
    expect(currentAppVersion()).toBe(packageJson.version);
  });
});
