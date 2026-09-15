import { ComponentType, lazy } from "react";
import {
  routeDefinitions,
  WnaRouteKey,
} from "@/navigation/routes/wnaNavigationRoutes";
import { getProjectPathSegment } from "@utils/projectRoutes";
import WnaHomeRoute from "@components/screens/WnaHomeRoute";

export type WnaRouteMatch = {
  // A route table intentionally mixes components with different prop
  // shapes (most take none, the project-details route takes a slug) —
  // typed loosely here, each component's own definition still enforces
  // its real prop contract at its call site below.
  Component: ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  params: Record<string, string>;
};

// Every route but the home screen loads on demand instead of shipping in
// the initial bundle: Lighthouse measured ~40% of that bundle as unused
// on first paint, since every screen (including rarely-visited ones like
// the legal pages) was imported eagerly regardless of which route the
// visitor actually lands on. `displayName` makes the resulting lazy
// wrapper identifiable in React DevTools and in wnaRouteTable.test.ts,
// which can't compare it by reference to the real, statically-imported
// component the way it could before.
function lazyRoute<P extends object>(
  importer: () => Promise<{ default: ComponentType<P> }>,
  displayName: string,
): ComponentType<P> {
  const Component = lazy(importer) as ComponentType<P> & {
    displayName?: string;
  };
  Component.displayName = displayName;
  return Component;
}

const routeComponents: Record<WnaRouteKey, ComponentType> = {
  root: WnaHomeRoute,
  menu: lazyRoute(
    () => import("@components/screens/WnaMenuRoute"),
    "WnaMenuRoute",
  ),
  disclaimer: lazyRoute(
    () => import("@components/screens/WnaDisclaimerRoute"),
    "WnaDisclaimerRoute",
  ),
  privacy: lazyRoute(
    () => import("@components/screens/WnaPrivacyRoute"),
    "WnaPrivacyRoute",
  ),
  terms: lazyRoute(
    () => import("@components/screens/WnaTermsRoute"),
    "WnaTermsRoute",
  ),
  licenses: lazyRoute(
    () => import("@components/screens/WnaLicensesRoute"),
    "WnaLicensesRoute",
  ),
  projects: lazyRoute(
    () => import("@components/screens/WnaProjectsRoute"),
    "WnaProjectsRoute",
  ),
  experience: lazyRoute(
    () => import("@components/screens/WnaExperienceRoute"),
    "WnaExperienceRoute",
  ),
  contact: lazyRoute(
    () => import("@components/screens/WnaContactRoute"),
    "WnaContactRoute",
  ),
};

const WnaProjectDetailsRoute = lazyRoute(
  () => import("@components/screens/WnaProjectDetailsRoute"),
  "WnaProjectDetailsRoute",
);

const staticRouteMap = new Map<string, ComponentType>();
for (const key of Object.keys(routeDefinitions) as WnaRouteKey[]) {
  const Component = routeComponents[key];
  for (const path of Object.values(routeDefinitions[key])) {
    staticRouteMap.set(path, Component);
  }
}

const projectPathPrefixes = (["de", "en"] as const).map(
  (lang) => `/${getProjectPathSegment(lang)}/`,
);

export function matchRoute(pathname: string): WnaRouteMatch | undefined {
  const staticComponent = staticRouteMap.get(pathname);
  if (staticComponent) {
    return { Component: staticComponent, params: {} };
  }

  for (const prefix of projectPathPrefixes) {
    if (pathname.startsWith(prefix)) {
      const slug = pathname.slice(prefix.length);
      if (slug) {
        return { Component: WnaProjectDetailsRoute, params: { slug } };
      }
    }
  }

  return undefined;
}
