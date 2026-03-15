import AppStyle from "@services/wnaStyleService";
import { FC, memo, ReactNode } from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

export type WnaButtonTextContentProps = {
  appStyle?: AppStyle;
  text: string;
  textColor: string;
  textStyle?: TextStyle | TextStyle[];
  containerStyle?: ViewStyle | ViewStyle[];
  childrenLeft?: ReactNode;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    marginHorizontal: 16,
  },
  text: {
    fontSize: 15,
    fontWeight: "500",
    marginHorizontal: 8,
    alignSelf: "center",
    letterSpacing: 0.5,
  },
  fallbackText: {
    fontSize: 15,
    fontWeight: "500",
  },
});

const WnaButtonTextContent: FC<WnaButtonTextContentProps> = ({
  appStyle,
  text,
  textColor,
  textStyle,
  containerStyle,
  childrenLeft,
}) => (
  <View style={[styles.container, containerStyle]}>
    {childrenLeft}
    <Text
      style={[
        appStyle?.textNeutralMedium ?? styles.fallbackText,
        styles.text,
        {
          color: textColor,
        },
        textStyle,
      ]}
    >
      {text}
    </Text>
  </View>
);

WnaButtonTextContent.displayName = "WnaButtonTextContent";

export default memo(WnaButtonTextContent);
