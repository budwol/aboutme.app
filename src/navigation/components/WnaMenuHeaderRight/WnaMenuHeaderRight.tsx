import WnaButtonHeader from "@components/buttons/WnaButtonHeader";
import AppStyle from "@/theme/appStyle";
import Colors from "@constants/theme/colors";
import { DrawerActions } from "@react-navigation/native";
import { i18nKeys } from "@/i18n/i18nKeys";
import { TFunction } from "i18next";
import { memo } from "react";
import { View } from "react-native";

type DrawerNavigationDispatcher = {
  dispatch: (action: ReturnType<typeof DrawerActions.openDrawer>) => void;
};

export type WnaMenuHeaderRightProps = {
  appColors: Colors;
  appStyle: AppStyle;
  navigation: DrawerNavigationDispatcher;
  t: TFunction<string[], undefined>;
};

function WnaMenuHeaderRight({
  appColors,
  appStyle,
  navigation,
  t,
}: WnaMenuHeaderRightProps) {
  return (
    <View style={{ alignItems: "center" }}>
      <WnaButtonHeader
        appStyle={appStyle}
        appColors={appColors}
        text={t(i18nKeys.screenTitleMenu)}
        iconName="menu"
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        t={t}
        checkInternetConnection={false}
      />
    </View>
  );
}

export default memo(WnaMenuHeaderRight);
