import { describe, expect, it } from "@jest/globals";
import { matchRoute } from "@/navigation/router/wnaRouteTable";
import { routeDefinitions } from "@/navigation/routes/wnaNavigationRoutes";
import WnaHomeRoute from "@components/screens/WnaHomeRoute";
import WnaMenuRoute from "@components/screens/WnaMenuRoute";
import WnaDisclaimerRoute from "@components/screens/WnaDisclaimerRoute";
import WnaPrivacyRoute from "@components/screens/WnaPrivacyRoute";
import WnaTermsRoute from "@components/screens/WnaTermsRoute";
import WnaLicensesRoute from "@components/screens/WnaLicensesRoute";
import WnaProjectsRoute from "@components/screens/WnaProjectsRoute";
import WnaExperienceRoute from "@components/screens/WnaExperienceRoute";
import WnaContactRoute from "@components/screens/WnaContactRoute";
import WnaProjectDetailsRoute from "@components/screens/WnaProjectDetailsRoute";

describe("matchRoute", () => {
  const expectedComponents = {
    root: WnaHomeRoute,
    menu: WnaMenuRoute,
    disclaimer: WnaDisclaimerRoute,
    privacy: WnaPrivacyRoute,
    terms: WnaTermsRoute,
    licenses: WnaLicensesRoute,
    projects: WnaProjectsRoute,
    experience: WnaExperienceRoute,
    contact: WnaContactRoute,
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

    expect(match).toBeDefined();
    expect(match!.Component).toBe(
      expectedComponents[key as keyof typeof expectedComponents],
    );
    expect(match!.params).toEqual({});
  });

  it("resolves a german project slug to WnaProjectDetailsRoute with the slug param", () => {
    const match = matchRoute("/projekte/pizza-app-2");

    expect(match?.Component).toBe(WnaProjectDetailsRoute);
    expect(match?.params).toEqual({ slug: "pizza-app-2" });
  });

  it("resolves an english project slug to WnaProjectDetailsRoute with the slug param", () => {
    const match = matchRoute("/projects/pizza-app-2");

    expect(match?.Component).toBe(WnaProjectDetailsRoute);
    expect(match?.params).toEqual({ slug: "pizza-app-2" });
  });

  it("does not match a project path with an empty slug segment", () => {
    expect(matchRoute("/projekte/")).toBeUndefined();
  });

  it("still resolves the bare projects list path to WnaProjectsRoute", () => {
    // "/projekte" (no trailing slash) is the static projects-list route
    // itself, not a project-detail prefix match.
    const match = matchRoute("/projekte");

    expect(match?.Component).toBe(WnaProjectsRoute);
    expect(match?.params).toEqual({});
  });

  it("returns undefined for an unknown path", () => {
    expect(matchRoute("/this-page-does-not-exist")).toBeUndefined();
  });
});
