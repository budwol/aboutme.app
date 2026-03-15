import React, { FC, memo } from "react";
import { View, StyleSheet } from "react-native";
import { ImageProps } from "expo-image";

import WnaImage, { WnaImageStyleProps } from "@components/images/WnaImage";
import Colors from "@constants/theme/colors";

interface WnaImageWithFrameProps extends ImageProps {
  appColors: Colors;
  tilt?: string;
  url: string;
  title: string;
}

const WnaImageWithFrame: FC<WnaImageWithFrameProps> = ({
  appColors,
  tilt = "0deg",
  url,
  title,
}) => {
  return (
    <View style={[styles.container, { transform: [{ rotate: tilt }] }]}>
      <View style={[styles.frame, { borderColor: appColors.warmgray1 }]}>
        <WnaImage
          appColors={appColors}
          imageUrl={url}
          imageTitle={title}
          style={
            {
              width: "100%",
              aspectRatio: 3 / 4,
            } as unknown as WnaImageStyleProps
          }
        />
      </View>
    </View>
  );
};

export default memo(WnaImageWithFrame);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  frame: {
    borderWidth: 16,
    overflow: "hidden",
    elevation: 8, // Android shadow
    width: 200,
    margin: 16,

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
});
