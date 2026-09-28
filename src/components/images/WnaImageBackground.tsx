import Colors from "@constants/theme/colors";
import { getVersionedLocalAssetUrl } from "@utils/versionedAssetUrl";
import React, { CSSProperties, ReactNode, useMemo } from "react";
import { WnaBlurView } from "../effects/WnaBlurView";

export type WnaImageBackgroundProps = {
  imageUri?: string;
  appColors: Colors;
  children: ReactNode;
  isDarkMode: boolean;
  testID?: string;
};

const WnaImageBackground = React.memo(
  ({
    imageUri,
    appColors,
    children,
    isDarkMode,
    testID,
  }: WnaImageBackgroundProps) => {
    const resolvedUri = useMemo(() => {
      return imageUri && imageUri.trim() !== ""
        ? getVersionedLocalAssetUrl(imageUri)
        : undefined;
    }, [imageUri]);

    if (!resolvedUri) {
      return React.createElement(
        "div",
        {
          id: testID,
          style: {
            ...styles.container,
            backgroundColor: appColors.white,
          } as CSSProperties,
        },
        children,
      );
    }

    return React.createElement(
      "div",
      {
        id: testID,
        style: {
          ...styles.container,
          backgroundColor: appColors.white,
        } as CSSProperties,
      },
      <img
        src={resolvedUri}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
        loading="eager"
        style={styles.webImage}
      />,
      // The blur stays an empty layer next to the content, not around it:
      // an element with backdrop-filter is a backdrop root, so any
      // backdrop-filter inside it (the header's scroll blur) could only
      // see what lies within this layer and would blur nothing.
      <WnaBlurView
        forceExperimentalBlur
        isBackground
        style={styles.backgroundLayer}
        blurTint="dark"
        blurIntensity={40}
        backgroundOpacity={isDarkMode ? 0.72 : 0.55}
      />,
      React.createElement(
        "div",
        { style: styles.contentLayer as CSSProperties },
        children,
      ),
    );
  },
);

WnaImageBackground.displayName = "WnaImageBackground";

const styles = {
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },
  backgroundLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  // Same box as the blur layer, and the flex column WnaBlurView used to
  // give the screens it wrapped.
  contentLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  webImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
} satisfies Record<string, CSSProperties>;

export default WnaImageBackground;
