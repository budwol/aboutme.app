import React, { FC, memo } from "react";
import { Platform, StyleSheet, View } from "react-native";
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
    elevation: 8,
    width: 200,
    margin: 16,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.25)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        }),
  },
});
