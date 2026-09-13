function setViewportDimensions(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
  });
}

type ViewportMock = {
  mockImplementation: (
    factory: () => { width: number; height: number },
  ) => void;
};

export function mockDimensions(width: number, height: number): ViewportMock {
  setViewportDimensions(width, height);

  return {
    mockImplementation: (factory) => {
      const nextDimensions = factory();
      setViewportDimensions(nextDimensions.width, nextDimensions.height);
    },
  };
}
