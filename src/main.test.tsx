import { afterEach, describe, expect, it, jest } from "@jest/globals";

const mockRender = jest.fn();
const mockCreateRoot = jest.fn((_container: Element | DocumentFragment) => ({
  render: mockRender,
}));

jest.mock("react-dom/client", () => ({
  createRoot: (container: Element | DocumentFragment) =>
    mockCreateRoot(container),
}));

jest.mock("@components/WnaRootLayout", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@components/WnaErrorBoundary", () => ({
  __esModule: true,
  default: () => null,
}));

describe("main", () => {
  afterEach(() => {
    jest.resetModules();
    mockRender.mockClear();
    mockCreateRoot.mockClear();
  });

  it("mounts the app into the #root container", () => {
    const container = document.createElement("div");
    container.id = "root";
    jest.spyOn(document, "getElementById").mockReturnValue(container);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("./main");

    expect(mockCreateRoot).toHaveBeenCalledWith(container);
    expect(mockRender).toHaveBeenCalledTimes(1);

    jest.restoreAllMocks();
  });

  it("throws when the #root container is missing", () => {
    jest.spyOn(document, "getElementById").mockReturnValue(null);

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("./main");
    }).toThrow("Root container #root not found");

    jest.restoreAllMocks();
  });
});
