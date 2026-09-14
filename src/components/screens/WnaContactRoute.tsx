import WnaSurfaceCard from "@/components/cards/WnaSurfaceCard";
import { useWnaAppData, useWnaTheme } from "@/state/WnaAppContext";
import WnaHeroImage from "@components/images/WnaHeroImage";
import WnaMenuToggleButton from "@/navigation/components/WnaMenuToggleButton";
import WnaHeaderRouteButton from "@/navigation/components/WnaHeaderRouteButton";
import { getDrawerNavigationPath } from "@/navigation/routes/wnaNavigationRoutes";
import WnaSeparatorHorizontal from "@components/display/WnaSeparatorHorizontal";
import WnaSectionTitle from "@components/text/WnaSectionTitle";
import WnaContactSection from "@components/sections/WnaContactSection";
import { i18nKeys } from "@/i18n/i18nKeys";
import { useRouter } from "expo-router";
import React, { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import WnaScrollViewScreen from "@components/screens/WnaScrollViewScreen";

const styles = {
  cardContent: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: 24,
  },
  detailGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
} satisfies Record<string, CSSProperties>;

export default function WnaContactRoute(): ReactNode {
  const { appColors, appStyle } = useWnaTheme();
  const { appData } = useWnaAppData();
  const { t } = useTranslation(["common"]);
  const router = useRouter();

  return (
    <WnaScrollViewScreen
      isRootPage
      headerTitle={t(i18nKeys.screenTitleContact)}
      titleHref={getDrawerNavigationPath("root")}
      iconName={"email"}
      showContactFooter={false}
      headerButton0={
        <WnaHeaderRouteButton
          appStyle={appStyle}
          appColors={appColors}
          router={router}
          route={"home"}
          t={t}
        />
      }
      headerButton1={
        <WnaMenuToggleButton appStyle={appStyle} appColors={appColors} t={t} />
      }
    >
      <WnaSurfaceCard appColors={appColors}>
        {React.createElement(
          "div",
          { style: styles.cardContent },
          <WnaHeroImage
            appColors={appColors}
            imageUrl="bg.webp"
            imageTitle={t(i18nKeys.screenTitleContact)}
          />,
          <WnaSectionTitle
            appColors={appColors}
            appStyle={appStyle}
            title={t(i18nKeys.screenTitleContact)}
            subtitle={t(i18nKeys.contactSubtitle).toUpperCase()}
          />,
          <WnaSeparatorHorizontal transparent={true} space={8} />,
          React.createElement(
            "div",
            { style: styles.detailGroup },
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                } as CSSProperties,
              },
              React.createElement(
                "span",
                { style: appStyle.textNeutralMedium as CSSProperties },
                appData.profile.name,
              ),
              React.createElement(
                "span",
                { style: appStyle.textNeutralMedium as CSSProperties },
                appData.contact.addressStreet,
              ),
              React.createElement(
                "span",
                { style: appStyle.textNeutralMedium as CSSProperties },
                appData.contact.addressZipCode,
                " ",
                appData.contact.addressCity,
              ),
              React.createElement(
                "span",
                { style: appStyle.textNeutralMedium as CSSProperties },
                appData.contact.addressCountry,
              ),
            ),
            <WnaSeparatorHorizontal transparent={true} space={16} />,
            <WnaContactSection
              appColors={appColors}
              appData={appData}
              appStyle={appStyle}
              t={t}
            />,
          ),
        )}
      </WnaSurfaceCard>
    </WnaScrollViewScreen>
  );
}
