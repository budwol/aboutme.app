import { useState } from "react";

export type WnaScrollYController = {
  scrollY: number;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
};

export function useWnaScrollY(): WnaScrollYController {
  const [scrollY, setScrollY] = useState(0);

  function onScroll(event: React.UIEvent<HTMLDivElement>) {
    setScrollY(event.currentTarget.scrollTop);
  }

  return { scrollY, onScroll };
}
