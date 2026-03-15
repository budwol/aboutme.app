import { useWnaLayout, useWnaTheme } from "@components/WnaAppContext";
import WnaFloatingButton from "@components/buttons/WnaFloatingButton";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import WnaSeparatorHorizontal from "@components/misc/WnaSeparatorHorizontal";
import { getNavigationBaseUrl } from "@components/navigation/wnaNavigationRouteProvider";
import WnaBaseScreen from "@components/screens/WnaBaseScreen";
import { useWnaScrollY } from "@components/screens/useWnaScrollY";
import WnaShareCard from "@components/welcome/WnaShareCard";
import { SeoEntry } from "@constants/seoCatalog";
import { i18nKeys } from "@services/i18n/i18nKeys";
import { cleanAndTruncate } from "@utils/stringHelper";
import Animated from "react-native-reanimated";
import { ReactElement, ReactNode, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, StyleSheet, View } from "react-native";
import Logger from "wna-logger";

const styles = StyleSheet.create({
  itemSeparator: {
    height: 8,
  },
  headerSpacing: {
    paddingBottom: 8,
  },
});

type KeyExtractorItem =
  | string
  | { identifier?: string; route?: string; text?: string };

const hasItemKey = (
  item: KeyExtractorItem,
): item is { identifier?: string; route?: string; text?: string } =>
  typeof item === "object" && item !== null;

export type WnaFlatListScreenProps<
  T extends KeyExtractorItem = KeyExtractorItem,
> = {
  isBusy?: boolean;
  seoEntry: SeoEntry;
  icon?: keyof typeof iconMap;
  headerButton0?: ReactNode;
  headerButton1?: ReactNode;
  headerButton2?: ReactNode;
  isRootPage?: boolean;
  displayFooter?: boolean;
  items: T[];
  renderItem: (item: T) => ReactNode;
  actionButtonTitle?: string;
  actionButtonIcon?: keyof typeof iconMap;
  actionButtonOnPress?: () => void;
  actionButtonCheckInternetConnection?: boolean;
  header?: ReactElement;
  showFooter?: boolean;
  onRefresh?: () => void;
};

const WnaFlatListScreen = <T extends KeyExtractorItem>(
  props: WnaFlatListScreenProps<T>,
) => {
  const { appColors, appStyle } = useWnaTheme();
  const { appLayout } = useWnaLayout();
  const { t } = useTranslation(["common"]);
  const { scrollY, onScroll } = useWnaScrollY();

  const renderFlatListItem = useCallback(
    ({ item }: { item: T }) => props.renderItem(item) as ReactElement,
    // eslint-disable-next-line
    [props.renderItem],
  );

  const keyExtractor = useCallback((item: T, index: number) => {
    if (typeof item === "string" && item) return item;
    if (!hasItemKey(item)) {
      Logger.warn("keyExtractor", "could not find identifier or route");
      return index.toString();
    }

    if (item?.identifier) return cleanAndTruncate(item.identifier);
    if (item?.route) return cleanAndTruncate(item.route);
    if (item?.text) return cleanAndTruncate(item.text);

    Logger.warn("keyExtractor", "could not find identifier or route");
    return index.toString();
  }, []);

  const itemSeparator = useCallback(
    () => <View style={styles.itemSeparator} />,
    [],
  );

  const contentContainerStyle = useMemo(
    () => [
      appStyle.containerCenterMaxWidth,
      {
        paddingBottom: appLayout.contentPaddingBottomWhenActionButton,
        paddingTop: appLayout.contentListPaddingTop,
      },
    ],
    [
      appLayout.contentListPaddingTop,
      appLayout.contentPaddingBottomWhenActionButton,
      appStyle.containerCenterMaxWidth,
    ],
  );

  const refreshControl = useMemo(
    () =>
      props.onRefresh ? (
        <RefreshControl
          refreshing={props.isBusy ?? false}
          onRefresh={props.onRefresh}
        />
      ) : undefined,
    [props.isBusy, props.onRefresh],
  );

  const listFooterComponent = useMemo(
    () =>
      props.showFooter ? (
        <View>
          <WnaSeparatorHorizontal transparent space={16} />
          <WnaShareCard
            url={getNavigationBaseUrl()}
            title={t(i18nKeys.appBrand)}
          />
        </View>
      ) : null,
    [props.showFooter, t],
  );

  const showActionButton =
    props.actionButtonTitle ||
    props.actionButtonIcon ||
    props.actionButtonOnPress;

  return (
    <WnaBaseScreen
      isRootPage={props.isRootPage}
      seoEntry={props.seoEntry}
      scrollY={scrollY}
      headerButton0={props.headerButton0}
      headerButton1={props.headerButton1}
      headerButton2={props.headerButton2}
      isBusy={props.isBusy}
    >
      <Animated.FlatList
        data={props.items}
        scrollEventThrottle={appLayout.scrollEventThrottle}
        onScroll={onScroll}
        contentContainerStyle={contentContainerStyle}
        ListHeaderComponentStyle={styles.headerSpacing}
        ItemSeparatorComponent={itemSeparator}
        refreshControl={refreshControl}
        keyExtractor={keyExtractor}
        ListHeaderComponent={props.header ?? null}
        ListFooterComponent={listFooterComponent}
        renderItem={renderFlatListItem}
      />

      {showActionButton && (
        <WnaFloatingButton
          t={t}
          appColors={appColors}
          appStyle={appStyle}
          title={props.actionButtonTitle ?? "no title"}
          iconName={props.actionButtonIcon ?? "cube"}
          checkInternetConnection={props.actionButtonCheckInternetConnection}
          onPress={props.actionButtonOnPress}
        />
      )}
    </WnaBaseScreen>
  );
};

export default WnaFlatListScreen;
