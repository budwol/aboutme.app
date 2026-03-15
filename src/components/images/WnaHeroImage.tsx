import { FC } from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ImageProps } from "expo-image";

import WnaImage, { WnaImageStyleProps } from "@components/images/WnaImage";
import { appLayoutConstants } from "@constants/layoutConstants";
import Colors from "@constants/theme/colors";
import { convertHexToRgba } from "@utils/colorConverter";

interface WnaHeroImageProps extends ImageProps {
  appColors: Colors;
  imageUrl: string;
  imageTitle: string;
  grayScale?: boolean;
  showGradient?: boolean;
  borderRadius?: number;
}

const WnaHeroImage: FC<WnaHeroImageProps> = ({
  appColors,
  imageUrl,
  imageTitle,
  grayScale = false,
  showGradient = false,
  borderRadius = appLayoutConstants.globalCornerRadius,
  ...imageProps
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          height: appLayoutConstants.globalHeroImageHeight,
          borderRadius,
        },
      ]}
    >
      <WnaImage
        {...imageProps}
        appColors={appColors}
        imageUrl={imageUrl}
        imageTitle={imageTitle}
        contentFit="cover"
        grayScale={grayScale}
        style={styles.image as unknown as WnaImageStyleProps}
      />

      {showGradient && (
        <LinearGradient
          colors={[
            convertHexToRgba(appColors.staticBlack, 0.24), // top
            convertHexToRgba(appColors.staticBlack, 0.0), // center
            convertHexToRgba(appColors.staticBlack, 0.55), // bottom
          ]}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            mixBlendMode: "multiply",
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: appLayoutConstants.globalHeroImageHeight,
  },
});

export default WnaHeroImage;
