import { Suspense, useEffect } from "react";
import { matchRoute } from "@/navigation/router/wnaRouteTable";
import { router, useWnaPathname } from "@/navigation/router/wnaRouter";
import { getNavigationPath } from "@/navigation/routes/wnaNavigationRoutes";

export default function WnaRoutes() {
  const pathname = useWnaPathname();
  const match = matchRoute(pathname);

  useEffect(() => {
    if (!match) {
      router.replace(getNavigationPath("root"));
    }
  }, [match, pathname]);

  if (!match) return null;

  const { Component, params } = match;

  // Every non-home route is now lazy-loaded (see wnaRouteTable.ts), so
  // this needs a Suspense boundary. `null` is safe as a fallback: on
  // first load it's covered by WnaApp's intro overlay, and on later
  // in-app navigation by its navigation-transition overlay -- both
  // already hide the outgoing/incoming screen regardless.
  return (
    <Suspense fallback={null}>
      <Component {...params} />
    </Suspense>
  );
}
