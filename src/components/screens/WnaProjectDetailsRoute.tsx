import {
  useWnaAppData,
  useWnaLayout,
  useWnaTheme,
} from "@components/WnaAppContext";
import WnaButtonIconText from "@components/buttons/WnaButtonIconText";
import WnaListCardWhiteDecent from "@components/cards/WnaListCardWhiteDecent";
import WnaHeroImage from "@components/images/WnaHeroImage";
import { getProjectImageForWidth } from "@components/images/wnaImageAssetResolver";
import WnaMenuHeaderRight from "@components/navigation/WnaMenuHeaderRight";
import WnaNavigationHeaderButtonRight from "@components/navigation/WnaNavigationHeaderButtonRight";
import { appLayoutConstants } from "@constants/layoutConstants";
import {
  getDrawerNavigationPath,
  getNavigationLang,
} from "@components/navigation/wnaNavigationRouteProvider";
import WnaScrollViewScreen from "@components/screens/WnaScrollViewScreen";
import WnaWelcomeTitle from "@components/text/WnaWelcomeTitle";
import WnaTechStackCard from "@components/welcome/WnaTechstackCard";
import { getLangCode } from "@services/i18n/i18n";
import { i18nKeys } from "@services/i18n/i18nKeys";
import { convertHexToRgba } from "@utils/colorConverter";
import { findProjectBySlug } from "@utils/projectRoutes";
import {
  Redirect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { ReactNode, useMemo } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

const styles = StyleSheet.create({
  cardContent: {
    width: "100%",
    gap: 24,
  },
  heroSection: {
    width: "100%",
  },
  heroBadgeContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    zIndex: 1,
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  contentBody: {
    gap: 24,
  },
  metaSection: {
    gap: 20,
    padding: 20,
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
  },
  contentSection: {
    gap: 20,
  },
  stackGroup: {
    gap: 12,
  },
  actionSection: {
    alignItems: "flex-end",
    gap: 12,
  },
  actionLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 16,
  },
  actionButton: {
    minWidth: 160,
    marginHorizontal: 0,
    height: 44,
    borderRadius: appLayoutConstants.globalCornerRadius,
  },
  descriptionSection: {
    gap: 16,
    padding: 20,
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
  },
  contextSection: {
    padding: 16,
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
    gap: 8,
  },
  projectContextText: {
    fontStyle: "italic",
    fontWeight: "400",
  },
  descriptionGroup: {
    gap: 20,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletGroup: {
    gap: 12,
    paddingTop: 4,
  },
  bulletMarker: {
    minWidth: 12,
  },
  bulletText: {
    flex: 1,
  },
});

function renderProjectDescription(
  description: string,
  appStyle: ReturnType<typeof useWnaTheme>["appStyle"],
) {
  const bodyTextStyle = {
    lineHeight: (appStyle.textNeutralMedium.lineHeight ?? 20) + 4,
  };
  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const nodes: ReactNode[] = [];
  let bulletLines: string[] = [];

  const flushBulletLines = () => {
    if (bulletLines.length === 0) {
      return;
    }

    nodes.push(
      <View
        key={`description-bullets-${nodes.length}`}
        style={styles.bulletGroup}
      >
        {bulletLines.map((line, index) => (
          <View key={`description-bullet-${index}`} style={styles.bulletRow}>
            <Text
              style={[
                appStyle.textNeutralMedium,
                bodyTextStyle,
                styles.bulletMarker,
              ]}
            >
              •
            </Text>
            <Text
              style={[
                appStyle.textNeutralMedium,
                bodyTextStyle,
                styles.bulletText,
              ]}
            >
              {line}
            </Text>
          </View>
        ))}
      </View>,
    );

    bulletLines = [];
  };

  for (const line of lines) {
    if (line.startsWith("- ")) {
      bulletLines.push(line.slice(2).trim());
      continue;
    }

    flushBulletLines();
    nodes.push(
      <Text
        key={`description-paragraph-${nodes.length}`}
        style={[appStyle.textNeutralMedium, bodyTextStyle]}
      >
        {line}
      </Text>,
    );
  }

  flushBulletLines();

  return nodes;
}

export default function WnaProjectDetailsRoute(): ReactNode {
  const { appColors, appStyle } = useWnaTheme();
  const { appData } = useWnaAppData();
  const { currentWindowWidth } = useWnaLayout();
  const { t } = useTranslation(["common"]);
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const rawSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const projectMatch = useMemo(
    () => findProjectBySlug(appData.projects, rawSlug),
    [appData.projects, rawSlug],
  );

  if (!projectMatch) {
    return (
      <Redirect
        href={getDrawerNavigationPath(
          "projects",
          getNavigationLang(getLangCode()),
        )}
      />
    );
  }

  const { project } = projectMatch;
  const lang = getNavigationLang(getLangCode());
  const projectLinks = [
    {
      url: project.repoUrl,
      label: t(i18nKeys.actionGithub),
      icon: "github" as const,
    },
    {
      url: project.webUrl,
      label: t(i18nKeys.actionWebApp),
      icon: "web" as const,
    },
    {
      url: project.playStoreUrl,
      label: t(i18nKeys.actionPlayStore),
      icon: "google-play" as const,
    },
  ].filter(
    (
      link,
    ): link is {
      url: string;
      label: string;
      icon: "github" | "web" | "google-play";
    } => Boolean(link.url),
  );

  return (
    <WnaScrollViewScreen
      headerTitle={project.title}
      iconName="rocket-launch-outline"
      titleHref={getDrawerNavigationPath("projects", lang)}
      showFooter={false}
      headerButton0={
        <WnaNavigationHeaderButtonRight
          appStyle={appStyle}
          appColors={appColors}
          router={router}
          route="home"
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
      <WnaListCardWhiteDecent appColors={appColors}>
        <View style={styles.cardContent}>
          <View style={styles.heroSection}>
            {project.subtitle ? (
              <View style={styles.heroBadgeContainer}>
                <View
                  style={[
                    styles.heroBadge,
                    {
                      backgroundColor: convertHexToRgba(
                        appColors.staticCoolgray8,
                        0.8,
                      ),
                      borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
                    },
                  ]}
                >
                  <Text
                    style={[
                      appStyle.textSmall,
                      {
                        color: appColors.staticWhite,
                        lineHeight: 16,
                      },
                    ]}
                  >
                    {project.subtitle}
                  </Text>
                </View>
              </View>
            ) : null}

            <WnaHeroImage
              appColors={appColors}
              imageUrl={`images/${getProjectImageForWidth(project, currentWindowWidth)}`}
              imageTitle={project.title}
            />
          </View>

          <WnaWelcomeTitle
            appColors={appColors}
            appStyle={appStyle}
            title={project.title}
            subtitle={project.context}
          />

          <View style={styles.contentBody}>
            <View
              style={[
                styles.metaSection,
                {
                  backgroundColor: convertHexToRgba(appColors.warmgray6, 0.12),
                  borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
                },
              ]}
            >
              {projectLinks.length > 0 ? (
                <View style={styles.actionSection}>
                  <View style={styles.actionLinks}>
                    {projectLinks.map((link) => (
                      <WnaButtonIconText
                        key={link.label}
                        appColors={appColors}
                        appStyle={appStyle}
                        iconName={link.icon}
                        text={link.label}
                        textColor={appColors.white}
                        backgroundColor={convertHexToRgba(
                          appColors.coolgray8,
                          0.96,
                        )}
                        borderWidth={1}
                        style={{
                          ...styles.actionButton,
                          borderColor: convertHexToRgba(
                            appColors.coolgray2,
                            0.72,
                          ),
                        }}
                        onPress={() => {
                          Linking.openURL(link.url);
                        }}
                      />
                    ))}
                  </View>
                </View>
              ) : null}

              <View style={styles.stackGroup}>
                {project.techstack.length > 0 ? (
                  <WnaTechStackCard
                    appColors={appColors}
                    appData={appData}
                    appStyle={appStyle}
                    t={t}
                    groups={[
                      {
                        key: "project-techstack",
                        title: t(i18nKeys.titleProjectTechstack),
                        stack: project.techstack,
                      },
                    ]}
                  />
                ) : null}
              </View>
            </View>

            <View style={styles.contentSection}>
              {project.description ? (
                <View
                  style={[
                    styles.descriptionSection,
                    {
                      backgroundColor: convertHexToRgba(
                        appColors.warmgray6,
                        0.2,
                      ),
                      borderColor: convertHexToRgba(appColors.coolgray2, 0.9),
                    },
                  ]}
                >
                  <View style={styles.descriptionGroup}>
                    {renderProjectDescription(project.description, appStyle)}
                  </View>
                </View>
              ) : null}

              {appData.projectDetailsContext ? (
                <View
                  style={[
                    styles.contextSection,
                    {
                      backgroundColor: convertHexToRgba(
                        appColors.warmgray6,
                        0.16,
                      ),
                      borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
                    },
                  ]}
                >
                  <Text
                    style={[
                      appStyle.textSmall,
                      {
                        ...styles.projectContextText,
                        lineHeight: (appStyle.textSmall.lineHeight ?? 16) + 4,
                        opacity: 0.78,
                      },
                    ]}
                  >
                    {appData.projectDetailsContext}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </WnaListCardWhiteDecent>
    </WnaScrollViewScreen>
  );
}
