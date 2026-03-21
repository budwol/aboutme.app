import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { AppLayout } from "@constants/layoutConstants";
import AppStyle from "@services/wnaStyleService";
import { ReactNode, useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View, ViewStyle } from "react-native";

export interface WnaMenuItem {
  route?: string;
  text: string;
  iconName?: keyof typeof iconMap;
  iconRightName?: keyof typeof iconMap;
  type: string;
  data?: unknown;
  onPress?: () => void | Promise<void>;
}

export type WnaNavigationListProps = {
  appStyle: AppStyle;
  appLayout: AppLayout;
  items: WnaMenuItem[];
  renderItem: (item: WnaMenuItem) => ReactNode;
  overrideGap?: number;
  overridePaddingTop?: number;
  style?: ViewStyle;
};

export default function WnaNavigationList(props: WnaNavigationListProps) {
  const {
    appLayout,
    appStyle,
    items,
    overrideGap,
    overridePaddingTop,
    renderItem,
    style,
  } = props;

  const listStyle = useMemo(
    () => [
      {
        paddingTop: overridePaddingTop ?? appLayout.contentListPaddingTop,
        paddingBottom: appLayout.contentPaddingBottom,
      },
      style ?? null,
    ],
    [
      appLayout.contentListPaddingTop,
      appLayout.contentPaddingBottom,
      overridePaddingTop,
      style,
    ],
  );

  const separatorHeight = overrideGap ?? appLayout.globalListGap;

  const renderMenuItem = useCallback(
    ({ item }: { item: WnaMenuItem }) =>
      !item ? null : (
        <View style={appStyle.containerCenterMaxWidth}>{renderItem(item)}</View>
      ),
    [appStyle.containerCenterMaxWidth, renderItem],
  );

  const renderSeparator = useCallback(
    () => <View style={[styles.separator, { height: separatorHeight }]} />,
    [separatorHeight],
  );

  const keyExtractor = useCallback(
    (item: WnaMenuItem, index: number) => item.route ?? `${item.text}-${index}`,
    [],
  );

  return (
    <FlatList
      extraData={items}
      style={listStyle}
      ItemSeparatorComponent={renderSeparator}
      keyExtractor={keyExtractor}
      data={items}
      renderItem={renderMenuItem}
      scrollEventThrottle={appLayout.scrollEventThrottle}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    width: "100%",
  },
});
