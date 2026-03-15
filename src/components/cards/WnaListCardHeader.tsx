import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import AppStyle from "@services/wnaStyleService";
import Colors from "@constants/theme/colors";
import { FC, memo } from "react";
import { Text, View } from "react-native";

export type WnaListCardHeaderProps = {
  appColors: Colors;
  appStyle: AppStyle;
  headerTitle?: string;
  hasRoute?: boolean;
  hasImages?: boolean;
  hasDownload?: boolean;
  forceRightTitle?: boolean;
};

const WnaListCardHeaderComponent: FC<WnaListCardHeaderProps> = ({
  appColors,
  appStyle,
  headerTitle,
  hasRoute,
  hasImages,
  forceRightTitle,
}) => {
  const shouldRender =
    (headerTitle !== null && headerTitle !== "") ||
    forceRightTitle ||
    hasImages === true ||
    hasRoute === true;

  return shouldRender ? (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        alignContent: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignSelf: "flex-start",
          alignItems: "center",
          alignContent: "center",
          gap: 12,
          padding: 8,
        }}
      >
        {hasImages === true ? (
          <WnaIcon
            size={16}
            iconName={"folder-multiple-image"}
            color={appColors.coolgray6}
          />
        ) : null}
        {hasRoute === true ? (
          <WnaIcon
            size={16}
            iconName={"map-outline"}
            color={appColors.coolgray6}
          />
        ) : null}
      </View>
      {headerTitle === null || headerTitle === "" ? null : (
        <Text
          style={[
            appStyle.textSmall,
            {
              alignSelf: "flex-end",
              color: appColors.accent4,
              textAlign: "right",
              padding: 8,
            },
          ]}
        >
          {headerTitle}
        </Text>
      )}
    </View>
  ) : null;
};

const WnaListCardHeader = memo(
  WnaListCardHeaderComponent,
  (prevProps, nextProps) =>
    prevProps.appColors.isDark === nextProps.appColors.isDark &&
    prevProps.hasImages === nextProps.hasImages &&
    prevProps.hasRoute === nextProps.hasRoute &&
    prevProps.headerTitle === nextProps.headerTitle,
);

WnaListCardHeader.displayName = "WnaListCardHeader";

export default WnaListCardHeader;
