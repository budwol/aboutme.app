import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { useBrowserColorScheme } from "@utils/useBrowserColorScheme";

function ColorSchemeProbe({
  onValue,
}: {
  onValue: (value: ReturnType<typeof useBrowserColorScheme>) => void;
}) {
  onValue(useBrowserColorScheme());
  return React.createElement("ColorSchemeProbe");
}

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  const removeEventListener = jest.fn(
    (_event: string, listener: () => void) => {
      listeners.delete(listener);
    },
  );
  const mediaQueryList = {
    matches,
    addEventListener: (_event: string, listener: () => void): void => {
      listeners.add(listener);
    },
    removeEventListener,
  };

  window.matchMedia = jest.fn().mockReturnValue(mediaQueryList) as never;

  return {
    fireChange: (nextMatches: boolean) => {
      mediaQueryList.matches = nextMatches;
      listeners.forEach((listener) => listener());
    },
    removeEventListener,
  };
}

describe("useBrowserColorScheme", () => {
  it("reads the initial color scheme from matchMedia", () => {
    mockMatchMedia(true);
    let value: ReturnType<typeof useBrowserColorScheme> | undefined;

    act(() => {
      TestRenderer.create(<ColorSchemeProbe onValue={(v) => (value = v)} />);
    });

    expect(value).toBe("dark");
  });

  it("returns light when the dark media query does not match", () => {
    mockMatchMedia(false);
    let value: ReturnType<typeof useBrowserColorScheme> | undefined;

    act(() => {
      TestRenderer.create(<ColorSchemeProbe onValue={(v) => (value = v)} />);
    });

    expect(value).toBe("light");
  });

  it("updates when the system color scheme changes", () => {
    const { fireChange } = mockMatchMedia(false);
    let value: ReturnType<typeof useBrowserColorScheme> | undefined;

    act(() => {
      TestRenderer.create(<ColorSchemeProbe onValue={(v) => (value = v)} />);
    });

    expect(value).toBe("light");

    act(() => {
      fireChange(true);
    });

    expect(value).toBe("dark");
  });

  it("removes the media query listener on unmount", () => {
    const { removeEventListener } = mockMatchMedia(false);
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<ColorSchemeProbe onValue={() => {}} />);
    });

    act(() => {
      tree!.unmount();
    });

    expect(removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("falls back to null when matchMedia is unavailable", () => {
    const original = window.matchMedia;
    // @ts-expect-error simulating an environment without matchMedia
    delete window.matchMedia;

    let value: ReturnType<typeof useBrowserColorScheme> | undefined;

    act(() => {
      TestRenderer.create(<ColorSchemeProbe onValue={(v) => (value = v)} />);
    });

    expect(value).toBeNull();

    window.matchMedia = original;
  });
});
