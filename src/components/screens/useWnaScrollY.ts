import {
  SharedValue,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

export type WnaScrollYController = {
  scrollY: SharedValue<number>;
  onScroll: ReturnType<typeof useAnimatedScrollHandler>;
};

export function useWnaScrollY(): WnaScrollYController {
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return { scrollY, onScroll };
}
