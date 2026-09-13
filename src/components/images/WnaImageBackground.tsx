import Colors from "@constants/theme/colors";
import { getVersionedLocalAssetUrl } from "@utils/versionedAssetUrl";
import React, { ReactNode, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WnaBlurView } from "../effects/WnaBlurView";

export type WnaImageBackgroundProps = {
  imageUri?: string;
  appColors: Colors;
  children: ReactNode;
  isDarkMode: boolean;
  testID?: string;
};

const WnaImageBackground = React.memo(
  ({ imageUri, appColors, children, testID }: WnaImageBackgroundProps) => {
    const resolvedUri = useMemo(() => {
      return imageUri && imageUri.trim() !== ""
        ? getVersionedLocalAssetUrl(imageUri)
        : undefined;
    }, [imageUri]);

    if (!resolvedUri) {
      return (
        <View
          nativeID={testID}
          testID={testID}
          style={[styles.container, { backgroundColor: appColors.white }]}
        >
          {children}
        </View>
      );
    }

    return (
      <View
        nativeID={testID}
        testID={testID}
        style={[styles.container, { backgroundColor: appColors.white }]}
      >
        <img
          src={resolvedUri}
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority="high"
          loading="eager"
          style={styles.webImage}
        />

        <WnaBlurView
          forceExperimentalBlur
          isBackground
          style={styles.backgroundLayer}
          blurTint="dark"
          blurIntensity={40}
        >
          {children}
        </WnaBlurView>
      </View>
    );
  },
);

WnaImageBackground.displayName = "WnaImageBackground";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  webImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});

export default WnaImageBackground;
