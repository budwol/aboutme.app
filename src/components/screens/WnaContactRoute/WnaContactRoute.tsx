import WnaSurfaceCard from "@/components/cards/WnaSurfaceCard";
import {
  useWnaAppData,
  useWnaLayout,
  useWnaTheme,
} from "@components/WnaAppContext";
import { getContactHeroImageForWidth } from "@components/images/wnaDecorativeImageResolver";
import WnaHeroImage from "@components/images/WnaHeroImage";
import WnaMenuHeaderRight from "@/navigation/components/WnaMenuHeaderRight";
import WnaNavigationHeaderButtonRight from "@/navigation/components/WnaNavigationHeaderButtonRight";
import WnaSeparatorHorizontal from "@components/display/WnaSeparatorHorizontal";
import WnaSectionTitle from "@components/text/WnaSectionTitle";
import WnaContactCard from "@components/sections/WnaContactCard";
import { i18nKeys } from "@/i18n/i18nKeys";
import { useNavigation, useRouter } from "expo-router";
import { ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import WnaScrollViewScreen from "@components/screens/WnaScrollViewScreen";

const styles = StyleSheet.create({
  cardContent: {
    width: "100%",
    gap: 24,
  },
  detailGroup: {
    gap: 16,
  },
});

export default function WnaContactRoute(): ReactNode {
  const { appColors, appStyle } = useWnaTheme();
  const { appData } = useWnaAppData();
  const { currentWindowWidth } = useWnaLayout();
  const { t } = useTranslation(["common"]);
  const router = useRouter();
  const navigation = useNavigation();
  const heroImageUrl = useMemo(
    () => getContactHeroImageForWidth(currentWindowWidth),
    [currentWindowWidth],
  );

  return (
    <WnaScrollViewScreen
      isRootPage
      headerTitle={t(i18nKeys.screenTitleContact)}
      iconName={"email"}
      showFooter={false}
      showContactFooter={false}
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
      <WnaSurfaceCard appColors={appColors}>
        <View style={styles.cardContent}>
          <WnaHeroImage
            appColors={appColors}
            imageUrl={heroImageUrl}
            imageTitle={t(i18nKeys.screenTitleContact)}
          />

          <WnaSectionTitle
            appColors={appColors}
            appStyle={appStyle}
            title={t(i18nKeys.screenTitleContact)}
            subtitle={t(i18nKeys.contactSubtitle).toUpperCase()}
          />

          <WnaSeparatorHorizontal transparent={true} space={8} />

          <View style={styles.detailGroup}>
            <View>
              <Text style={appStyle.textNeutralMedium}>
                {appData.profile.name}
              </Text>
              <Text style={appStyle.textNeutralMedium}>
                {appData.contact.addressStreet}
              </Text>
              <Text style={appStyle.textNeutralMedium}>
                {appData.contact.addressZipCode} {appData.contact.addressCity}
              </Text>
              <Text style={appStyle.textNeutralMedium}>
                {appData.contact.addressCountry}
              </Text>
            </View>

            <WnaSeparatorHorizontal transparent={true} space={16} />

            <WnaContactCard
              appColors={appColors}
              appData={appData}
              appStyle={appStyle}
              t={t}
            />
          </View>
        </View>
      </WnaSurfaceCard>
    </WnaScrollViewScreen>
  );
}
