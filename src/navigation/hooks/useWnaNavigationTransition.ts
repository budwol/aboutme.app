import * as WnaAppContext from "@components/WnaAppContext";
import { Href, Router } from "expo-router";
import { useCallback } from "react";

export function useWnaNavigationTransition(router: Router) {
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
    (href: Href) => {
      runNavigationTransition(() => {
        router.push(href);
      });
    },
    [router, runNavigationTransition],
  );

  const replace = useCallback(
    (href: Href) => {
      runNavigationTransition(() => {
        router.replace(href);
      });
    },
    [router, runNavigationTransition],
  );

  const navigate = useCallback(
    (href: Href) => {
      runNavigationTransition(() => {
        router.navigate(href);
      });
    },
    [router, runNavigationTransition],
  );

  const back = useCallback(
    (fallbackHref?: Href) => {
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
