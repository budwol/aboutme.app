import { ComponentType } from "react";
import {
  routeDefinitions,
  WnaRouteKey,
} from "@/navigation/routes/wnaNavigationRoutes";
import { getProjectPathSegment } from "@utils/projectRoutes";
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

export type WnaRouteMatch = {
  // A route table intentionally mixes components with different prop
  // shapes (most take none, the project-details route takes a slug) —
  // typed loosely here, each component's own definition still enforces
  // its real prop contract at its call site below.
  Component: ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  params: Record<string, string>;
};

const routeComponents: Record<WnaRouteKey, ComponentType> = {
  root: WnaHomeRoute,
  menu: WnaMenuRoute,
  disclaimer: WnaDisclaimerRoute,
  privacy: WnaPrivacyRoute,
  terms: WnaTermsRoute,
  licenses: WnaLicensesRoute,
  projects: WnaProjectsRoute,
  experience: WnaExperienceRoute,
  contact: WnaContactRoute,
};

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
