import Colors from "@constants/theme/colors";
import AppStyle from "@/theme/appStyle";
import { FC, memo } from "react";
import { Text, TextStyle } from "react-native";

export type WnaCardTextContentProps = {
  appColors: Colors;
  appStyle?: AppStyle;
  title?: string;
  subtitle?: string;
  description?: string;
  subtitleAlign?: TextStyle["textAlign"];
  titleAlign?: TextStyle["textAlign"];
  titleMinHeight?: number;
  titlePaddingHorizontal?: number;
  titlePaddingTop?: number;
  bodyPadding?: number;
  subtitlePaddingHorizontal?: number;
  titleNumberOfLines?: number;
  subtitleNumberOfLines?: number;
};

const WnaCardTextContent: FC<WnaCardTextContentProps> = ({
  appColors,
  appStyle,
  title,
  subtitle,
  description,
  subtitleAlign,
  titleAlign,
  titleMinHeight,
  titlePaddingHorizontal,
  titlePaddingTop,
  bodyPadding,
  subtitlePaddingHorizontal,
  titleNumberOfLines,
  subtitleNumberOfLines,
}) => (
  <>
    {title !== undefined ? (
      <Text
        numberOfLines={titleNumberOfLines}
        style={
          appStyle
            ? [
                appStyle.textNeutralMedium,
                {
                  paddingHorizontal: titlePaddingHorizontal ?? 0,
                  paddingTop: titlePaddingTop ?? 0,
                  lineHeight:
                    (appStyle.textNeutralMedium?.lineHeight ?? 18) + 2,
                  minHeight: titleMinHeight,
                  textAlign: titleAlign ?? "left",
                },
              ]
            : {
                color: appColors.black,
                fontSize: 14,
                fontWeight: "600",
                paddingHorizontal: titlePaddingHorizontal ?? 0,
                paddingTop: titlePaddingTop ?? 0,
                lineHeight: 18,
                minHeight: titleMinHeight,
                textAlign: titleAlign ?? "left",
              }
        }
      >
        {title}
      </Text>
    ) : null}

    {subtitle !== undefined ? (
      <Text
        numberOfLines={subtitleNumberOfLines}
        style={
          appStyle
            ? [
                appStyle.textNeutralSmall,
                {
                  padding: bodyPadding ?? 0,
                  lineHeight: (appStyle.textNeutralSmall?.lineHeight ?? 16) + 2,
                  paddingHorizontal:
                    subtitlePaddingHorizontal ?? bodyPadding ?? 0,
                  textAlign: subtitleAlign ?? "left",
                },
              ]
            : {
                color: appColors.black,
                fontSize: 13,
                lineHeight: 16,
                paddingHorizontal: subtitlePaddingHorizontal ?? 0,
                textAlign: subtitleAlign ?? "left",
              }
        }
      >
        {subtitle}
      </Text>
    ) : null}

    {!!description && (
      <Text style={appStyle?.textNeutralMicro ?? { color: appColors.black }}>
        {description}
      </Text>
    )}
  </>
);

WnaCardTextContent.displayName = "WnaCardTextContent";

export default memo(WnaCardTextContent);
