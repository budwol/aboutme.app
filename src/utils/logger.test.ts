/* eslint-disable @typescript-eslint/no-require-imports */
import { afterEach, describe, expect, it, jest } from "@jest/globals";

const mockLoggerBase = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const mockIsDevMode = jest.fn();

jest.mock("@utils/loggerBase", () => ({
  __esModule: true,
  default: mockLoggerBase,
}));

jest.mock("@utils/publicEnv", () => ({
  isDevMode: () => mockIsDevMode(),
}));

describe("Logger", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("forwards messages to LoggerBase in dev mode", () => {
    mockIsDevMode.mockReturnValue(true);
    const Logger = require("@utils/logger").default;

    Logger.info("hello");
    Logger.warn("method", "warn");
    Logger.error("method", "error");

    expect(mockLoggerBase.info).toHaveBeenCalledWith("hello");
    expect(mockLoggerBase.warn).toHaveBeenCalledWith("method", "warn");
    expect(mockLoggerBase.error).toHaveBeenCalledWith("method", "error");
  });

  it("does not initialize LoggerBase outside dev mode", () => {
    mockIsDevMode.mockReturnValue(false);
    const Logger = require("@utils/logger").default;

    Logger.info("hello");
    Logger.warn("method", "warn");
    Logger.error("method", "error");

    expect(mockLoggerBase.info).not.toHaveBeenCalled();
    expect(mockLoggerBase.warn).not.toHaveBeenCalled();
    expect(mockLoggerBase.error).not.toHaveBeenCalled();
  });
});
