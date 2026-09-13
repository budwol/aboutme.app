import { useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

export type WnaScrollYController = {
  scrollY: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function useWnaScrollY(): WnaScrollYController {
  const [scrollY, setScrollY] = useState(0);

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setScrollY(event.nativeEvent.contentOffset.y);
  }

  return { scrollY, onScroll };
}
