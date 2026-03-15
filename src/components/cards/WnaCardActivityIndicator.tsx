import WnaActivityIndicator from "@components/misc/WnaActivityIndicator";
import Colors from "@constants/theme/colors";
import AppStyle from "@services/wnaStyleService";
import { FC, memo } from "react";
import { Text } from "react-native";
import WnaListCardWhiteDecent from "./WnaListCardWhiteDecent";

export type WnaCardActivityIndicatorProps = {
  appColors: Colors;
  appStyle: AppStyle;
  isBusyText?: string;
};

const WnaCardActivityIndicatorComponent: FC<WnaCardActivityIndicatorProps> = ({
  appColors,
  appStyle,
  isBusyText,
}) => {
  const text = isBusyText && isBusyText !== "" ? isBusyText : "...";

  return (
    <WnaListCardWhiteDecent appColors={appColors}>
      <WnaActivityIndicator appColors={appColors} />
      <Text
        style={[
          appStyle.textTitleLarge,
          {
            width: 128,
            marginTop: 24,
            textAlign: "center",
          },
        ]}
      >
        {text}
      </Text>
    </WnaListCardWhiteDecent>
  );
};

const WnaCardActivityIndicator = memo(WnaCardActivityIndicatorComponent);

WnaCardActivityIndicator.displayName = "WnaCardActivityIndicator";

export default WnaCardActivityIndicator;
