import WnaWelcomeTitle from "@components/text/WnaWelcomeTitle";
import { Text, View } from "react-native";
import WnaImage from "@components/images/WnaImage";
import { WnaWelcomeProps } from "@components/welcome/WnaWelcomeProps";
import WnaTechStackCard from "@components/welcome/WnaTechstackCard";
import { appLayoutConstants } from "@constants/layoutConstants";
import { i18nKeys } from "@services/i18n/i18nKeys";
import { convertHexToRgba } from "@utils/colorConverter";
import { useEffect } from "react";
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useReducedMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Colors from "@constants/theme/colors";

type HeroShape = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  width: number;
  height: number;
  radius: number;
  borderColorOpacity: number;
  backgroundOpacity: number;
  accent?: boolean;
  white?: boolean;
  rotate: number;
  swing: 1 | -1;
  animated?: boolean;
};

const heroShapes: HeroShape[] = [
  {
    top: 18,
    left: 18,
    width: 92,
    height: 92,
    radius: 46,
    borderColorOpacity: 0.2,
    backgroundOpacity: 0.07,
    accent: true,
    rotate: -4,
    swing: 1,
    animated: true,
  },
  {
    top: 62,
    right: 8,
    width: 132,
    height: 132,
    radius: 66,
    borderColorOpacity: 0.24,
    backgroundOpacity: 0.06,
    rotate: 10,
    swing: -1,
    animated: true,
  },
  {
    top: 34,
    right: 54,
    width: 56,
    height: 56,
    radius: 28,
    borderColorOpacity: 0.22,
    backgroundOpacity: 0.09,
    accent: true,
    rotate: 3,
    swing: 1,
    animated: true,
  },
  {
    top: 118,
    left: 12,
    width: 72,
    height: 72,
    radius: 36,
    borderColorOpacity: 0.2,
    backgroundOpacity: 0.16,
    white: true,
    rotate: 0,
    swing: -1,
  },
  {
    top: 168,
    right: 26,
    width: 84,
    height: 84,
    radius: 42,
    borderColorOpacity: 0.18,
    backgroundOpacity: 0.04,
    rotate: -8,
    swing: 1,
  },
  {
    bottom: 18,
    left: 24,
    width: 64,
    height: 64,
    radius: 32,
    borderColorOpacity: 0.16,
    backgroundOpacity: 0.05,
    accent: true,
    rotate: 6,
    swing: -1,
  },
  {
    bottom: 42,
    right: 82,
    width: 44,
    height: 44,
    radius: 22,
    borderColorOpacity: 0.18,
    backgroundOpacity: 0.16,
    white: true,
    rotate: -2,
    swing: 1,
  },
  {
    top: 92,
    left: 146,
    width: 38,
    height: 38,
    radius: 19,
    borderColorOpacity: 0.18,
    backgroundOpacity: 0.08,
    accent: true,
    rotate: 8,
    swing: -1,
  },
  {
    top: 196,
    left: 84,
    width: 112,
    height: 112,
    radius: 56,
    borderColorOpacity: 0.16,
    backgroundOpacity: 0.04,
    rotate: -6,
    swing: 1,
  },
  {
    top: 22,
    right: 132,
    width: 74,
    height: 74,
    radius: 37,
    borderColorOpacity: 0.18,
    backgroundOpacity: 0.05,
    rotate: 14,
    swing: -1,
  },
  {
    top: 12,
    left: 108,
    width: 34,
    height: 34,
    radius: 17,
    borderColorOpacity: 0.14,
    backgroundOpacity: 0.05,
    accent: true,
    rotate: -10,
    swing: 1,
  },
  {
    top: 54,
    left: 214,
    width: 52,
    height: 52,
    radius: 26,
    borderColorOpacity: 0.16,
    backgroundOpacity: 0.04,
    rotate: 4,
    swing: -1,
  },
  {
    top: 94,
    right: 178,
    width: 26,
    height: 26,
    radius: 13,
    borderColorOpacity: 0.18,
    backgroundOpacity: 0.08,
    accent: true,
    rotate: 12,
    swing: 1,
    animated: true,
  },
  {
    top: 132,
    left: 86,
    width: 118,
    height: 118,
    radius: 59,
    borderColorOpacity: 0.12,
    backgroundOpacity: 0.03,
    white: true,
    rotate: -3,
    swing: -1,
  },
  {
    top: 156,
    right: 118,
    width: 58,
    height: 58,
    radius: 29,
    borderColorOpacity: 0.16,
    backgroundOpacity: 0.05,
    rotate: 8,
    swing: 1,
  },
  {
    top: 188,
    left: 18,
    width: 30,
    height: 30,
    radius: 15,
    borderColorOpacity: 0.16,
    backgroundOpacity: 0.07,
    accent: true,
    rotate: -6,
    swing: -1,
  },
  {
    bottom: 18,
    left: 102,
    width: 42,
    height: 42,
    radius: 21,
    borderColorOpacity: 0.14,
    backgroundOpacity: 0.05,
    rotate: 5,
    swing: 1,
  },
  {
    bottom: 26,
    right: 18,
    width: 88,
    height: 88,
    radius: 44,
    borderColorOpacity: 0.14,
    backgroundOpacity: 0.03,
    white: true,
    rotate: -10,
    swing: -1,
  },
  {
    bottom: 82,
    right: 148,
    width: 24,
    height: 24,
    radius: 12,
    borderColorOpacity: 0.16,
    backgroundOpacity: 0.08,
    accent: true,
    rotate: 6,
    swing: 1,
    animated: true,
  },
  {
    bottom: 108,
    left: 176,
    width: 66,
    height: 66,
    radius: 33,
    borderColorOpacity: 0.15,
    backgroundOpacity: 0.04,
    rotate: -7,
    swing: -1,
  },
];

function WnaHeroShape({
  shape,
  heroMotion,
  appColors,
  shouldAnimate,
}: {
  shape: HeroShape;
  heroMotion: SharedValue<number>;
  appColors: Colors;
  shouldAnimate: boolean;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    if (!shouldAnimate || !shape.animated) {
      return {
        opacity: 1,
        transform: [{ rotate: `${shape.rotate}deg` }],
      };
    }

    const scale = interpolate(
      heroMotion.value,
      [-1, 1],
      shape.swing === 1 ? [0.96, 1.04] : [1.04, 0.96],
    );
    const opacity = interpolate(
      heroMotion.value,
      [-1, 1],
      shape.swing === 1 ? [0.5, 0.82] : [0.8, 0.52],
    );
    const rotate = interpolate(
      heroMotion.value,
      [-1, 1],
      [shape.rotate - 2.5 * shape.swing, shape.rotate + 2.5 * shape.swing],
    );
    const translateX = interpolate(
      heroMotion.value,
      [-1, 1],
      [-4 * shape.swing, 4 * shape.swing],
    );
    const translateY = interpolate(
      heroMotion.value,
      [-1, 1],
      [3 * shape.swing, -3 * shape.swing],
    );

    return {
      opacity,
      transform: [
        { translateX },
        { translateY },
        { rotate: `${rotate}deg` },
        { scale },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: shape.top,
          right: shape.right,
          bottom: shape.bottom,
          left: shape.left,
          width: shape.width,
          height: shape.height,
          borderRadius: shape.radius,
          borderWidth: 1,
          borderColor: convertHexToRgba(
            shape.accent ? appColors.accent5 : appColors.coolgray2,
            shape.borderColorOpacity,
          ),
          backgroundColor: convertHexToRgba(
            shape.white
              ? appColors.white
              : shape.accent
                ? appColors.accent5
                : appColors.warmgray6,
            shape.backgroundOpacity,
          ),
        },
        animatedStyle,
      ]}
    />
  );
}

export default function WnaWelcomeCard({
  appColors,
  appData,
  appStyle,
  t,
}: WnaWelcomeProps) {
  const avatarSize = 200;
  const heroMotion = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const shouldAnimate = !reduceMotion;

  useEffect(() => {
    if (!shouldAnimate) {
      heroMotion.value = 0;
      return;
    }

    heroMotion.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 13000,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(-1, {
          duration: 13000,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      true,
    );
  }, [heroMotion, shouldAnimate]);

  return (
    <View style={{ width: "100%", gap: 24 }}>
      <View
        style={{
          position: "relative",
          overflow: "hidden",
          gap: 16,
          padding: 18,
          borderRadius: appLayoutConstants.globalCornerRadius,
          borderWidth: 1,
          backgroundColor: convertHexToRgba(appColors.warmgray6, 0.08),
          borderColor: convertHexToRgba(appColors.coolgray2, 0.52),
        }}
      >
        {heroShapes.map((shape, index) => (
          <WnaHeroShape
            key={`hero-shape-${index}`}
            shape={shape}
            heroMotion={heroMotion}
            appColors={appColors}
            shouldAnimate={shouldAnimate}
          />
        ))}

        <View
          style={{ alignItems: "center", height: avatarSize, marginTop: 8 }}
        >
          <WnaImage
            appColors={appColors}
            imageUrl={`images/${appData.profile.avatar}`}
            imageTitle={t(i18nKeys.imageTitleAvatar)}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: appColors.white,
              borderWidth: 1,
              borderColor: appColors.coolgray2,
            }}
          />
        </View>

        <WnaWelcomeTitle
          appColors={appColors}
          appStyle={appStyle}
          title={appData.profile.name}
          subtitle={appData.profile.title.toUpperCase()}
        />
      </View>

      <View
        style={{ gap: appLayoutConstants.globalListGap, paddingVertical: 8 }}
      >
        {appData.profile.description
          .split("\n")
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
          .map((value, index) => (
            <Text
              key={`description-${index}`}
              style={appStyle.textNeutralMedium}
            >
              {value}
            </Text>
          ))}

        <WnaTechStackCard
          appColors={appColors}
          appData={appData}
          appStyle={appStyle}
          t={t}
        />
      </View>
    </View>
  );
}
