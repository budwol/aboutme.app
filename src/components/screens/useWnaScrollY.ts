import { RefObject, useLayoutEffect, useRef, useState } from "react";
import {
  getSavedScrollY,
  saveScrollY,
  useWnaPathname,
} from "@/navigation/router/wnaRouter";

export type WnaScrollYController = {
  scrollY: number;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

export function useWnaScrollY(): WnaScrollYController {
  const pathname = useWnaPathname();
  const [scrollY, setScrollY] = useState(() => getSavedScrollY(pathname));
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const node = scrollContainerRef.current;
    const restored = getSavedScrollY(pathname);
    if (!node || restored === 0) return;

    const canReachTarget = () =>
      node.scrollHeight - node.clientHeight >= restored;

    node.scrollTop = restored;
    if (canReachTarget()) return;

    if (typeof ResizeObserver === "undefined") return;

    // Some screens defer part of their content for performance (see
    // WnaHomeRoute's showDeferredSections), so the container can still be
    // too short to actually reach the saved position at mount time --
    // the assignment above just gets silently clamped back to 0 in that
    // case. Keep watching until the content has grown enough to reach it,
    // apply it exactly once more, then stop -- never re-touch scrollTop
    // after that, so a later resize can't yank a real user scroll back to
    // this stale target.
    const observer = new ResizeObserver(() => {
      if (canReachTarget()) {
        node.scrollTop = restored;
        observer.disconnect();
      }
    });
    observer.observe(node);

    return () => observer.disconnect();
    // Every route mounts fresh (see wnaRouteTable.ts), so this component
    // instance's pathname can never change under it -- this only ever
    // needs to run once, right after this exact mount's container exists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onScroll(event: React.UIEvent<HTMLDivElement>) {
    const nextScrollY = event.currentTarget.scrollTop;
    setScrollY(nextScrollY);
    saveScrollY(pathname, nextScrollY);
  }

  return { scrollY, onScroll, scrollContainerRef };
}
