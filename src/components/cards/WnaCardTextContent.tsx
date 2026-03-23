import Colors from "@constants/theme/colors";
import AppStyle from "@/theme/appStyle";
import { FC, memo } from "react";
import { Text } from "react-native";

export type WnaCardTextContentProps = {
  appColors: Colors;
  appStyle?: AppStyle;
  title?: string;
  subtitle?: string;
  description?: string;
  titlePaddingTop?: number;
  bodyPadding?: number;
};

const WnaCardTextContent: FC<WnaCardTextContentProps> = ({
  appColors,
  appStyle,
  title,
  subtitle,
  description,
  titlePaddingTop,
  bodyPadding,
}) => (
  <>
    {title !== undefined ? (
      <Text
        style={
          appStyle
            ? [appStyle.textNeutralMedium, { paddingTop: titlePaddingTop ?? 0 }]
            : {
                color: appColors.black,
                fontSize: 14,
                fontWeight: "600",
                paddingTop: titlePaddingTop ?? 0,
              }
        }
      >
        {title}
      </Text>
    ) : null}

    {subtitle !== undefined ? (
      <Text
        style={
          appStyle
            ? [appStyle.textNeutralSmall, { padding: bodyPadding ?? 0 }]
            : {
                color: appColors.black,
                fontSize: 13,
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
