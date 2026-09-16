import { Suspense, useEffect } from "react";
import { matchRoute, preloadRoute } from "@/navigation/router/wnaRouteTable";
import {
  registerRoutePreloader,
  router,
  useWnaPathname,
} from "@/navigation/router/wnaRouter";
import { getNavigationPath } from "@/navigation/routes/wnaNavigationRoutes";

// Wires the route table's preloader into the router as a side effect of
// importing this module (loaded once, at app bootstrap, well before any
// navigation can happen) instead of wnaRouter.ts importing wnaRouteTable.ts
// directly -- that would pull every screen component into wnaRouter.ts's
// graph and, through their own header buttons, straight back into
// useWnaNavigationTransition, which already depends on wnaRouter.ts.
registerRoutePreloader(preloadRoute);

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
