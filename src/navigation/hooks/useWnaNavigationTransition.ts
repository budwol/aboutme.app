import * as WnaAppContext from "@/state/WnaAppContext";
import { WnaHref, WnaRouter } from "@/navigation/router/wnaRouter";
import { preloadRoute } from "@/navigation/router/wnaRouteTable";
import { useCallback } from "react";

export function useWnaNavigationTransition(router: WnaRouter) {
  const useLifecycle = WnaAppContext.useWnaAppLifecycle ?? (() => null);
  const lifecycle = useLifecycle();
  const isNavigationTransitionActive =
    lifecycle?.isNavigationTransitionActive ?? false;
  const startNavigationTransition = lifecycle?.startNavigationTransition;

  const runNavigationTransition = useCallback(
    (action: () => void) => {
      if (isNavigationTransitionActive) {
        return;
      }

      if (typeof startNavigationTransition !== "function") {
        action();
        return;
      }

      startNavigationTransition(action);
    },
    [isNavigationTransitionActive, startNavigationTransition],
  );

  const push = useCallback(
    (href: WnaHref) => {
      // Start the target route's chunk downloading immediately instead of
      // waiting for Suspense to trigger it once the URL actually changes --
      // otherwise the transition overlay can finish fading before a slow
      // chunk load does, briefly revealing a blank Suspense fallback (see
      // WnaRoutes.tsx) instead of the real screen.
      const ready = preloadRoute(href);

      runNavigationTransition(() => {
        void ready.then(() => router.push(href));
      });
    },
    [router, runNavigationTransition],
  );

  const replace = useCallback(
    (href: WnaHref) => {
      const ready = preloadRoute(href);

      runNavigationTransition(() => {
        void ready.then(() => router.replace(href));
      });
    },
    [router, runNavigationTransition],
  );

  const navigate = useCallback(
    (href: WnaHref) => {
      const ready = preloadRoute(href);

      runNavigationTransition(() => {
        void ready.then(() => router.navigate(href));
      });
    },
    [router, runNavigationTransition],
  );

  const back = useCallback(
    (fallbackHref?: WnaHref) => {
      runNavigationTransition(() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }

        if (fallbackHref) {
          router.replace(fallbackHref);
        }
      });
    },
    [router, runNavigationTransition],
  );

  return {
    back,
    navigate,
    push,
    replace,
    runNavigationTransition,
  };
}
