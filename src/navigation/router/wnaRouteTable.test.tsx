import { describe, expect, it, jest } from "@jest/globals";
import React, { Suspense } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { matchRoute, preloadRoute } from "@/navigation/router/wnaRouteTable";
import { routeDefinitions } from "@/navigation/routes/wnaNavigationRoutes";
import WnaHomeRoute from "@components/screens/WnaHomeRoute";

function mockScreen(name: string) {
  return function MockScreen(props: unknown) {
    return React.createElement(name, props as Record<string, unknown>);
  };
}

jest.mock("@components/screens/WnaMenuRoute", () => ({
  __esModule: true,
  default: mockScreen("WnaMenuRoute"),
}));
jest.mock("@components/screens/WnaDisclaimerRoute", () => ({
  __esModule: true,
  default: mockScreen("WnaDisclaimerRoute"),
}));
jest.mock("@components/screens/WnaPrivacyRoute", () => ({
  __esModule: true,
  default: mockScreen("WnaPrivacyRoute"),
}));
jest.mock("@components/screens/WnaTermsRoute", () => ({
  __esModule: true,
  default: mockScreen("WnaTermsRoute"),
}));
jest.mock("@components/screens/WnaLicensesRoute", () => ({
  __esModule: true,
  default: mockScreen("WnaLicensesRoute"),
}));
jest.mock("@components/screens/WnaProjectsRoute", () => ({
  __esModule: true,
  default: mockScreen("WnaProjectsRoute"),
}));
jest.mock("@components/screens/WnaExperienceRoute", () => ({
  __esModule: true,
  default: mockScreen("WnaExperienceRoute"),
}));
jest.mock("@components/screens/WnaContactRoute", () => ({
  __esModule: true,
  default: mockScreen("WnaContactRoute"),
}));
jest.mock("@components/screens/WnaProjectDetailsRoute", () => ({
  __esModule: true,
  default: mockScreen("WnaProjectDetailsRoute"),
}));

describe("matchRoute", () => {
  // Every route but "root" is lazy-loaded (see wnaRouteTable.ts), so it
  // can no longer be compared by reference to the real, statically
  // imported component the way "root" still can -- lazy() returns a new
  // wrapper object each time it's called, not the module itself. Its
  // displayName is the stable, intentional identifier set for exactly
  // this purpose.
  const expectedComponentNames = {
    root: "WnaHomeRoute",
    menu: "WnaMenuRoute",
    disclaimer: "WnaDisclaimerRoute",
    privacy: "WnaPrivacyRoute",
    terms: "WnaTermsRoute",
    licenses: "WnaLicensesRoute",
    projects: "WnaProjectsRoute",
    experience: "WnaExperienceRoute",
    contact: "WnaContactRoute",
  } as const;

  it.each(
    Object.entries(routeDefinitions).flatMap(([key, byLang]) =>
      (Object.entries(byLang) as [string, string][]).map(([lang, path]) => [
        key,
        lang,
        path,
      ]),
    ),
  )("resolves %s (%s) at %s to the right component", (key, _lang, path) => {
    const match = matchRoute(path as string);
    const expectedName =
      expectedComponentNames[key as keyof typeof expectedComponentNames];

    expect(match).toBeDefined();
    if (expectedName === "WnaHomeRoute") {
      expect(match!.Component).toBe(WnaHomeRoute);
    } else {
      expect((match!.Component as { displayName?: string }).displayName).toBe(
        expectedName,
      );
    }
    expect(match!.params).toEqual({});
  });

  it("resolves a german project slug to WnaProjectDetailsRoute with the slug param", () => {
    const match = matchRoute("/projekte/pizza-app-2");

    expect(
      (match?.Component as { displayName?: string } | undefined)?.displayName,
    ).toBe("WnaProjectDetailsRoute");
    expect(match?.params).toEqual({ slug: "pizza-app-2" });
  });

  it("resolves an english project slug to WnaProjectDetailsRoute with the slug param", () => {
    const match = matchRoute("/projects/pizza-app-2");

    expect(
      (match?.Component as { displayName?: string } | undefined)?.displayName,
    ).toBe("WnaProjectDetailsRoute");
    expect(match?.params).toEqual({ slug: "pizza-app-2" });
  });

  it("resolves the same lazy component instance for every matching path", () => {
    // Regression test: matchRoute() must return the same lazy() wrapper
    // every time, not call lazy() fresh per lookup -- otherwise React
    // would treat each navigation to the same route as a brand new
    // component type and remount it instead of reusing the loaded chunk.
    const first = matchRoute("/menu");
    const second = matchRoute("/menu");

    expect(first?.Component).toBe(second?.Component);
  });

  it("does not match a project path with an empty slug segment", () => {
    expect(matchRoute("/projekte/")).toBeUndefined();
  });

  it("still resolves the bare projects list path to WnaProjectsRoute", () => {
    // "/projekte" (no trailing slash) is the static projects-list route
    // itself, not a project-detail prefix match.
    const match = matchRoute("/projekte");

    expect((match?.Component as { displayName?: string }).displayName).toBe(
      "WnaProjectsRoute",
    );
    expect(match?.params).toEqual({});
  });

  it("returns undefined for an unknown path", () => {
    expect(matchRoute("/this-page-does-not-exist")).toBeUndefined();
  });

  it.each([
    ["/menu", "WnaMenuRoute"],
    ["/menu/impressum", "WnaDisclaimerRoute"],
    ["/menu/datenschutz", "WnaPrivacyRoute"],
    ["/menu/nutzungsbedingungen", "WnaTermsRoute"],
    ["/menu/lizenzen", "WnaLicensesRoute"],
    ["/projekte", "WnaProjectsRoute"],
    ["/taetigkeiten", "WnaExperienceRoute"],
    ["/kontakt", "WnaContactRoute"],
    ["/projekte/pizza-app-2", "WnaProjectDetailsRoute"],
  ])(
    "actually resolves the lazy import for %s to its real screen module",
    async (path, expectedName) => {
      // The tests above only check the lazy wrapper's displayName --
      // they never call the import() each route key is wired to, so a
      // typo in one of wnaRouteTable.ts's import paths would still
      // report full coverage while silently never resolving at
      // runtime. Rendering behind Suspense forces every import() to
      // actually run and confirms it resolves to the intended module.
      const match = matchRoute(path);
      if (!match) throw new Error(`no route matched ${path}`);
      const { Component, params } = match;
      let tree: ReturnType<typeof TestRenderer.create> | undefined;

      await act(async () => {
        tree = TestRenderer.create(
          <Suspense fallback={null}>
            <Component {...params} />
          </Suspense>,
        );
      });

      expect(tree!.root.findByType(expectedName)).toBeTruthy();
    },
  );
});

describe("preloadRoute", () => {
  it("kicks off the matched lazy route's chunk download", async () => {
    await expect(preloadRoute("/menu")).resolves.toEqual(
      expect.objectContaining({ default: expect.any(Function) }),
    );
  });

  it("resolves without a match", async () => {
    await expect(
      preloadRoute("/this-page-does-not-exist"),
    ).resolves.toBeUndefined();
  });

  it("does not preload the root route (it isn't lazy)", async () => {
    await expect(preloadRoute("/")).resolves.toBeUndefined();
  });

  it("swallows a failed chunk load instead of rejecting", async () => {
    // Regression test: useWnaNavigationTransition awaits this promise
    // before it ever changes the URL, so a rejection here would silently
    // block every future navigation to that route instead of just letting
    // Suspense handle the failure the normal way once it actually renders.
    const match = matchRoute("/menu");
    const component = match!.Component as { preload?: () => Promise<unknown> };
    const originalPreload = component.preload;
    component.preload = () => Promise.reject(new Error("chunk load failed"));

    try {
      await expect(preloadRoute("/menu")).resolves.toBeUndefined();
    } finally {
      component.preload = originalPreload;
    }
  });
});
