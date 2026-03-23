import Colors from "@constants/theme/colors";
import { getVersionedLocalAssetUrl } from "@utils/versionedAssetUrl";
import { ImageStyle } from "expo-image";
import React, { ReactNode, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WnaBlurView } from "../effects/WnaBlurView";

export type WnaImageBackgroundProps = {
  imageUri?: string;
  appColors: Colors;
  imageStyle?: ImageStyle;
  children: ReactNode;
  isDarkMode: boolean;
};

const WnaImageBackground = React.memo(
  ({
    imageUri,
    appColors,
    imageStyle: _imageStyle,
    children,
    isDarkMode,
  }: WnaImageBackgroundProps) => {
    const resolvedUri = useMemo(() => {
      return imageUri && imageUri.trim() !== ""
        ? getVersionedLocalAssetUrl(imageUri)
        : undefined;
    }, [imageUri]);

    if (!resolvedUri) {
      return (
        <View style={[styles.container, { backgroundColor: appColors.white }]}>
          {children}
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: appColors.white }]}>
        <img
          src={resolvedUri}
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority="low"
          style={styles.webImage}
        />

        <WnaBlurView
          forceExperimentalBlur
          isBackground
          style={styles.container}
          blurTint={isDarkMode ? "dark" : "dark"}
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
