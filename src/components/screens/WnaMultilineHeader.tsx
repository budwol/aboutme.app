import { cleanAndTruncate } from "@/utils/stringHelper";
import { AppLayout } from "@constants/layoutConstants";
import AppStyle from "@services/wnaStyleService";
import Colors from "@constants/theme/colors";
import { convertHexToRgba } from "@utils/colorConverter";
import { StyleSheet, Text, View } from "react-native";
import WnaPressable from "../buttons/WnaPressable";
import WnaImage from "@components/images/WnaImage";

export default function WnaMultilineHeader(
  appColors: Colors,
  appStyle: AppStyle,
  appLayout: AppLayout,
  isTabRoot: boolean,
  isLandscape: boolean,
  headerTitle?: string,
  onPress: () => void = () => {},
) {
  if (!headerTitle) return null;

  const title = headerTitle;
  const maxLength = 4096;
  let mainTitle = "";
  let subTitle = "";
  if (title) {
    const titleSegments = title.split("|");
    if (titleSegments.length > 1) {
      mainTitle = cleanAndTruncate(titleSegments[0].trim(), maxLength);
      subTitle = cleanAndTruncate(titleSegments[1].trim(), maxLength);
    } else {
      mainTitle = cleanAndTruncate(title.trim(), maxLength);
    }
  }

  const showLogo = isTabRoot;
  const logoSize = 32;
  const altText = "logo";
  let logoCornerRadius = logoSize / 2;

  return (
    <View
      style={{
        flexShrink: 1,
        minWidth: 0,
        height: appLayout.headerHeight,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          alignSelf: "stretch",
          flexDirection: "row",
          alignItems: "center",
          flexShrink: 1,
          minWidth: 0,
          minHeight: 64,
        }}
      >
        <WnaPressable
          ripple={"light"}
          onPress={onPress}
          style={{
            borderRadius: appLayout.globalCornerRadius,
            overflow: "hidden",
            outlineColor: convertHexToRgba(appColors.staticWhite, 0.5),
            outlineOffset: 2,
            height: appLayout.headerButtonHeight,
          }}
        >
          <View
            style={{
              alignSelf: "stretch",
              flexDirection: "row",
              alignItems: "center",
              flexShrink: 1,
              minWidth: 0,
              paddingHorizontal: 8,
            }}
          >
            {showLogo ? (
              <WnaImage
                imageUrl={"/logo_96.webp"}
                imageTitle={altText}
                appColors={appColors}
                style={{
                  width: logoSize,
                  height: logoSize,
                  borderRadius: logoCornerRadius,
                }}
                hideBackground
                contentFit="contain"
              />
            ) : null}
            {subTitle === "" ? (
              <View
                style={{
                  height: 64,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 8,
                  paddingLeft: showLogo ? 16 : 8,
                }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    appStyle.textTitleLarge,
                    styles(appColors).text,
                    {
                      fontSize: isLandscape ? 20 : 16,
                    },
                  ]}
                >
                  {mainTitle}
                </Text>
              </View>
            ) : (
              <View
                style={{
                  padding: 8,
                  flexShrink: 1,
                  minWidth: 0,
                  height: appLayout.headerButtonHeight,
                  justifyContent: "center",
                }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[appStyle.textSmall, styles(appColors).text]}
                >
                  {mainTitle}
                </Text>

                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[appStyle.textSmall, styles(appColors).text]}
                >
                  {subTitle}
                </Text>
              </View>
            )}
          </View>
        </WnaPressable>
      </View>
    </View>
  );
}

const styles = (appColors: Colors) =>
  StyleSheet.create({
    text: {
      flexShrink: 1,
      color: appColors.staticWhite,
      includeFontPadding: false,
      textAlignVertical: "center",
    },
  });
