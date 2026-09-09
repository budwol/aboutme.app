import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import LoggerBase, { shouldIgnoreLogMessage } from "@utils/logger.base";

describe("shouldIgnoreLogMessage", () => {
  let infoSpy: jest.SpiedFunction<typeof console.info>;
  let warnSpy: jest.SpiedFunction<typeof console.warn>;
  let errorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("filters known noisy warnings", () => {
    expect(
      shouldIgnoreLogMessage(
        "Blocked aria-hidden on an element because its descendant retained focus",
      ),
    ).toBe(true);
  });

  it("leaves unrelated messages alone", () => {
    expect(shouldIgnoreLogMessage("A real application error")).toBe(false);
  });

  it("logs info, warn and error messages without throwing", () => {
    expect(() => LoggerBase.info("hello")).not.toThrow();
    expect(() => LoggerBase.warn("method", "careful")).not.toThrow();
    expect(() => LoggerBase.error("method", "broken")).not.toThrow();

    expect(infoSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("skips ignored warning messages before they reach transports", () => {
    expect(() =>
      LoggerBase.warn(
        "method",
        "Support for defaultProps will be removed from function components",
      ),
    ).not.toThrow();
  });
});
