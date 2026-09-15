import { useSyncExternalStore } from "react";

export type WnaHref = string;

export type WnaRouter = {
  push: (href: WnaHref) => void;
  replace: (href: WnaHref) => void;
  navigate: (href: WnaHref) => void;
  back: (fallbackHref?: WnaHref) => void;
  canGoBack: () => boolean;
};

type WnaHistoryState = { __wnaNavIndex?: number };

let navIndex = 0;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function getPathname(): string {
  return typeof window === "undefined" ? "/" : window.location.pathname;
}

function subscribe(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("popstate", listener);
  listeners.add(listener);

  return () => {
    window.removeEventListener("popstate", listener);
    listeners.delete(listener);
  };
}

function push(href: WnaHref) {
  if (typeof window === "undefined") return;

  navIndex += 1;
  window.history.pushState({ __wnaNavIndex: navIndex }, "", href);
  notify();
}

function replace(href: WnaHref) {
  if (typeof window === "undefined") return;

  // Preserve the current entry's nav-depth as-is (or none, if there was
  // none) — a fresh entry gained via replaceState must not gain a back
  // target it didn't already have.
  const state = window.history.state as WnaHistoryState | null;
  const nextState: WnaHistoryState | null =
    state?.__wnaNavIndex !== undefined
      ? { __wnaNavIndex: state.__wnaNavIndex }
      : null;
  window.history.replaceState(nextState, "", href);
  notify();
}

function navigate(href: WnaHref) {
  push(href);
}

function canGoBack(): boolean {
  if (typeof window === "undefined") return false;

  const state = window.history.state as WnaHistoryState | null;
  return (state?.__wnaNavIndex ?? 0) > 0;
}

function back(fallbackHref?: WnaHref) {
  if (canGoBack()) {
    window.history.back();
    return;
  }

  if (fallbackHref) {
    replace(fallbackHref);
  }
}

export const router: WnaRouter = { push, replace, navigate, back, canGoBack };

export function useWnaPathname(): string {
  return useSyncExternalStore(subscribe, getPathname, getPathname);
}
