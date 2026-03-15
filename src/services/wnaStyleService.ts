import { appLayoutConstants } from "@constants/layoutConstants";
import Colors from "@constants/theme/colors";
import { FontFamilies } from "@constants/theme/fontFamilies";
import { convertHexToRgba } from "@utils/colorConverter";
import { StyleSheet } from "react-native";
import { TextStyle, ViewStyle } from "react-native";

export default interface AppStyle {
  containerCenterMaxWidth: ViewStyle;
  containerMaxWidth: ViewStyle;
  containerCenter: ViewStyle;
  containerCenterCenter: ViewStyle;
  containerFillPage: ViewStyle;
  containerFillPageMaxWidth: ViewStyle;
  containerForInputCenterCenter: ViewStyle;
  containerForInputTopCenter: ViewStyle;
  navigationHeaderTitleStyle: ViewStyle;
  tabBarBadgeStyle: ViewStyle;
  tabBarStyle: ViewStyle;
  buttonWithText: ViewStyle;
  separator: ViewStyle;
  textExtraLarge: TextStyle;
  textLarge: TextStyle;
  textMedium: TextStyle;
  textSmall: TextStyle;
  textMicro: TextStyle;
  textNeutralExtraLarge: TextStyle;
  textNeutralLarge: TextStyle;
  textNeutralMedium: TextStyle;
  textNeutralSmall: TextStyle;
  textNeutralMicro: TextStyle;
  textTitleLarge: TextStyle;
  textNeutralTitleLarge: TextStyle;
  textNeutralSubtitle: TextStyle;
  textInput: TextStyle;
  separatorHorizontal: object;
  maxWidth: object;
}

const setAppStyle = (colors: Colors) => {
  const style = StyleSheet.create({
    maxWidth: {
      maxWidth: appLayoutConstants.maxContentWidth,
      width: "100%",
    },
    // VIEW CONTAINER
    containerMaxWidth: {
      maxWidth: appLayoutConstants.maxContentWidth,
      width: "100%",
    },
    containerCenterMaxWidth: {
      maxWidth: appLayoutConstants.maxContentWidth,
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: 16,
    },
    containerCenter: {
      alignItems: "center",
    },

    containerCenterCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    containerFillPage: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    containerFillPageMaxWidth: {
      maxWidth: appLayoutConstants.maxContentWidth,
      width: "100%",
      alignSelf: "stretch",
      alignItems: "center",
      padding: 16,
      position: "absolute",
      top: 0,
      bottom: 0,
    },

    containerForInputTopCenter: {
      alignItems: "center",
      justifyContent: "flex-start",
      flex: 1,
      flexDirection: "column",
      gap: 16,
      width: "100%",
    },

    containerForInputCenterCenter: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      flexDirection: "column",
      gap: 16,
      width: "100%",
    },

    // NAVIGATION
    navigationHeaderTitleStyle: {
      fontFamily: FontFamilies.UI,
      fontWeight: "bold",
      width: "100%",
      borderTopWidth: 0,
      borderBottomWidth: 0,
    },

    // tabbar
    tabBarStyle: {
      backgroundColor: colors.white,
      borderTopWidth: 0,
      borderBottomWidth: 0,
    },

    tabBarBadgeStyle: {
      backgroundColor: colors.red3,
      color: colors.staticWhite,
    },

    // Buttons
    buttonWithText: {
      padding: 16,
      borderRadius: 8,
      minWidth: 128,
      overflow: "hidden",
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: "80%",
    },

    // TEXT

    textExtraLarge: {
      fontSize: 24,
      lineHeight: 30,
      fontFamily: FontFamilies.UI,
      fontWeight: "600",
      color: colors.black,
    },

    textLarge: {
      fontSize: 18,
      lineHeight: 24,
      fontFamily: FontFamilies.UI,
      fontWeight: "600",
      color: colors.black,
    },

    textMedium: {
      fontSize: 16,
      lineHeight: 22,
      fontFamily: FontFamilies.UI,
      fontWeight: "600",
      color: colors.black,
    },

    textSmall: {
      fontSize: 14,
      lineHeight: 18,
      fontFamily: FontFamilies.UI,
      fontWeight: "600",
      color: colors.black,
    },

    textMicro: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: FontFamilies.UI,
      fontWeight: "500",
      color: colors.black,
    },

    textNeutralExtraLarge: {
      fontSize: 24,
      lineHeight: 30,
      fontFamily: FontFamilies.UI,
      fontWeight: "500",
      color: colors.black,
    },

    textNeutralLarge: {
      fontSize: 18,
      fontWeight: "500",
      lineHeight: 24,
      fontFamily: FontFamilies.UI,
      color: colors.black,
    },

    textNeutralMedium: {
      fontSize: 15,
      fontWeight: "400",
      lineHeight: 22,
      fontFamily: FontFamilies.UI,
      color: colors.coolgray8,
    },

    textNeutralSmall: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 18,
      fontFamily: FontFamilies.UI,
      color: colors.coolgray6,
    },

    textNeutralMicro: {
      fontSize: 12,
      fontWeight: "400",
      lineHeight: 18,
      fontFamily: FontFamilies.UI,
      color: colors.coolgray6,
    },

    textTitleLarge: {
      fontSize: 18,
      fontFamily: FontFamilies.UI,
      fontWeight: "600",
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: colors.black,
    },

    textNeutralTitleLarge: {
      fontSize: 16,
      fontFamily: FontFamilies.UI,
      color: colors.black,
      letterSpacing: 1.4,
    },

    textNeutralSubtitle: {
      fontSize: 16,
      fontWeight: "500",
      letterSpacing: 0.5,
      textAlign: "center",
      lineHeight: 22,
      color: colors.isDark ? colors.coolgray7 : colors.coolgray5,
    },

    textInput: {
      borderWidth: 1,
      borderRadius: 8,
      borderColor: convertHexToRgba(colors.coolgray2, 0.5),
      width: "80%",
      padding: 8,
      fontSize: 18,
      lineHeight: 24,
      height: appLayoutConstants.textInputHeight,
      backgroundColor: colors.white,
      color: colors.black,
      verticalAlign: "middle",
      fontFamily: FontFamilies.UI,
    },

    // SEPARATOR
    separatorHorizontal: {
      minHeight: 1,
      margin: 16,
      minWidth: 128,
      width: "90%",
    },
  });
  return style as AppStyle;
};

export { setAppStyle };
