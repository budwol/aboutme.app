import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { AppLayout } from "@constants/layoutConstants";
import AppStyle from "@/theme/appStyle";
import { Fragment, ReactNode, useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";

export interface WnaMenuItem {
  route?: string;
  text: string;
  iconName?: keyof typeof iconMap;
  type: "nav" | "secondary";
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
    ({ item }: { item: WnaMenuItem }) => (
      <View style={appStyle.containerCenterMaxWidth}>{renderItem(item)}</View>
    ),
    [appStyle.containerCenterMaxWidth, renderItem],
  );

  const renderSeparator = useCallback(
    () => <View style={[styles.separator, { height: separatorHeight }]} />,
    [separatorHeight],
  );

  return (
    <ScrollView
      style={listStyle}
      scrollEventThrottle={appLayout.scrollEventThrottle}
    >
      {items.map((item, index) => (
        <Fragment key={item.route ?? `${item.text}-${index}`}>
          {renderMenuItem({ item })}
          {index < items.length - 1 ? renderSeparator() : null}
        </Fragment>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  separator: {
    width: "100%",
  },
});
