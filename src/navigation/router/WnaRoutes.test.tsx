import { describe, expect, it, jest } from "@jest/globals";
import React, { lazy } from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaRoutes from "@/navigation/router/WnaRoutes";

const mockUseWnaPathname = jest.fn();
const mockMatchRoute = jest.fn();
const mockReplace = jest.fn();
const mockGetNavigationPath = jest.fn((_key: string) => "/root");

jest.mock("@/navigation/router/wnaRouteTable", () => ({
  matchRoute: (...args: unknown[]) => mockMatchRoute(...args),
}));

jest.mock("@/navigation/router/wnaRouter", () => ({
  router: { replace: (href: string) => mockReplace(href) },
  useWnaPathname: () => mockUseWnaPathname(),
}));

jest.mock("@/navigation/routes/wnaNavigationRoutes", () => ({
  getNavigationPath: (key: string) => mockGetNavigationPath(key),
}));

function MockScreen({ slug }: { slug?: string }) {
  return React.createElement("MockScreen", { slug });
}

describe("WnaRoutes", () => {
  it("renders the matched route's component with its params", () => {
    mockUseWnaPathname.mockReturnValue("/projekte/pizza-app-2");
    mockMatchRoute.mockReturnValue({
      Component: MockScreen,
      params: { slug: "pizza-app-2" },
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaRoutes />);
    });

    const screen = tree!.root.findByType(MockScreen);
    expect(screen.props.slug).toBe("pizza-app-2");
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("resolves a lazy route component behind a Suspense boundary", async () => {
    // Regression test: wnaRouteTable.ts now hands out React.lazy()
    // components for every route but the home screen. Without a
    // Suspense boundary around <Component/>, mounting one of these
    // throws instead of rendering -- this exercises the real lazy()
    // + Suspense pairing end to end instead of mocking it away.
    function LazyMockScreen({ slug }: { slug?: string }) {
      return React.createElement("LazyMockScreen", { slug });
    }
    const LazyComponent = lazy(() =>
      Promise.resolve({ default: LazyMockScreen }),
    );

    mockUseWnaPathname.mockReturnValue("/projekte/pizza-app-2");
    mockMatchRoute.mockReturnValue({
      Component: LazyComponent,
      params: { slug: "pizza-app-2" },
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaRoutes />);
    });

    const screen = tree!.root.findByType(LazyMockScreen);
    expect(screen.props.slug).toBe("pizza-app-2");
  });

  it("renders nothing and redirects to the root route when no route matches", () => {
    mockUseWnaPathname.mockReturnValue("/this-page-does-not-exist");
    mockMatchRoute.mockReturnValue(undefined);

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaRoutes />);
    });

    expect(tree!.toJSON()).toBeNull();
    expect(mockGetNavigationPath).toHaveBeenCalledWith("root");
    expect(mockReplace).toHaveBeenCalledWith("/root");
  });
});
