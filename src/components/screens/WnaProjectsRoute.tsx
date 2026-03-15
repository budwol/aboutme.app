import { ProjectEntry } from "@/app-data";
import {
  useWnaAppData,
  useWnaLayout,
  useWnaTheme,
} from "@components/WnaAppContext";
import WnaListCardWhiteDecent from "@components/cards/WnaListCardWhiteDecent";
import WnaHeroImage from "@components/images/WnaHeroImage";
import { getProjectImageForWidth } from "@components/images/wnaImageAssetResolver";
import WnaMenuHeaderRight from "@components/navigation/WnaMenuHeaderRight";
import WnaNavigationHeaderButtonRight from "@components/navigation/WnaNavigationHeaderButtonRight";
import WnaBaseScreen from "@components/screens/WnaBaseScreen";
import { useWnaScrollY } from "@components/screens/useWnaScrollY";
import WnaWelcomeTitle from "@components/text/WnaWelcomeTitle";
import { seoCatalog } from "@constants/seoCatalog";
import { useNavigation, useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import { ReactNode, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  itemSeparator: {
    height: 16,
  },
  cardContent: {
    width: "100%",
    gap: 24,
  },
});

export default function WnaProjectsRoute(): ReactNode {
  const { appColors, appStyle } = useWnaTheme();
  const { appData } = useWnaAppData();
  const { appLayout, currentWindowWidth } = useWnaLayout();
  const { t } = useTranslation(["common"]);
  const navigation = useNavigation();
  const router = useRouter();
  const { scrollY, onScroll } = useWnaScrollY();
  const projectImageWidth = currentWindowWidth;

  const itemSeparator = useCallback(
    () => <View style={styles.itemSeparator} />,
    [],
  );
  const contentContainerStyle = useMemo(
    () => ({
      paddingBottom: appLayout.contentPaddingBottomWhenActionButton,
      paddingTop: appLayout.contentListPaddingTop,
      paddingHorizontal: 16,
    }),
    [
      appLayout.contentListPaddingTop,
      appLayout.contentPaddingBottomWhenActionButton,
    ],
  );

  const renderItem = useCallback(
    (item: ProjectEntry) => (
      <View style={appStyle.containerCenterMaxWidth}>
        <WnaListCardWhiteDecent appColors={appColors}>
          <View style={styles.cardContent}>
            <WnaHeroImage
              appColors={appColors}
              imageUrl={`images/${getProjectImageForWidth(item, projectImageWidth)}`}
              imageTitle={item.title}
              showGradient
            />

            <WnaWelcomeTitle
              appColors={appColors}
              appStyle={appStyle}
              title={item.title}
              subtitle={item.subtitle}
            />
          </View>
        </WnaListCardWhiteDecent>
      </View>
    ),
    [appColors, appStyle, projectImageWidth],
  );

  return (
    <WnaBaseScreen
      isRootPage
      seoEntry={seoCatalog.projects}
      scrollY={scrollY}
      headerButton0={
        <WnaNavigationHeaderButtonRight
          appStyle={appStyle}
          appColors={appColors}
          router={router}
          route={"home"}
          t={t}
        />
      }
      headerButton1={
        <WnaMenuHeaderRight
          appStyle={appStyle}
          appColors={appColors}
          t={t}
          navigation={navigation}
        />
      }
    >
      <Animated.FlatList
        scrollEventThrottle={appLayout.scrollEventThrottle}
        onScroll={onScroll}
        keyExtractor={(item) => item.title}
        ItemSeparatorComponent={itemSeparator}
        data={appData.projects}
        contentContainerStyle={contentContainerStyle}
        renderItem={({ item }) => renderItem(item)}
      />
    </WnaBaseScreen>
  );
}
