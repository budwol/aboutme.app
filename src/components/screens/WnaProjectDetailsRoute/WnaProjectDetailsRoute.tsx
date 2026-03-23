import {
  useWnaAppData,
  useWnaLayout,
  useWnaTheme,
} from "@components/WnaAppContext";
import WnaButtonIconText from "@components/buttons/WnaButtonIconText";
import WnaSurfaceCard from "@components/cards/WnaSurfaceCard";
import WnaHeroImage from "@components/images/WnaHeroImage";
import { getProjectImageForWidth } from "@components/images/wnaImageAssetResolver";
import WnaMenuHeaderRight from "@/navigation/components/WnaMenuHeaderRight";
import WnaNavigationHeaderButtonRight from "@/navigation/components/WnaNavigationHeaderButtonRight";
import { appLayoutConstants } from "@constants/layoutConstants";
import {
  getDrawerNavigationPath,
  getNavigationLang,
} from "@/navigation/routes/wnaNavigationRouteProvider";
import WnaScrollViewScreen from "@components/screens/WnaScrollViewScreen";
import WnaSectionTitle from "@components/text/WnaSectionTitle";
import WnaTechStackCard from "@components/sections/WnaTechStackCard";
import { getLangCode } from "@/i18n/i18n";
import { i18nKeys } from "@/i18n/i18nKeys";
import { convertHexToRgba } from "@utils/colorConverter";
import { findProjectBySlug } from "@utils/projectRoutes";
import {
  Redirect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { ReactNode, useMemo, useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
    height: appLayoutConstants.textInputHeight,
    borderRadius: appLayoutConstants.globalCornerRadius,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.52)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalDialog: {
    width: "100%",
    maxWidth: 560,
    padding: 24,
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
    gap: 20,
  },
  modalHeader: {
    gap: 8,
  },
  modalBody: {
    gap: 10,
  },
  modalActions: {
    gap: 12,
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
  const [isPrivateRepoModalVisible, setIsPrivateRepoModalVisible] =
    useState(false);
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
  const privateRepoMailToUrl = `mailto:${appData.contact.email}?subject=${encodeURIComponent(
    `Repository review: ${project.title}`,
  )}&body=${encodeURIComponent(
    `Hello,\n\nI would be interested in a review of the project "${project.title}".\n\nBest regards`,
  )}`;
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
      <WnaSurfaceCard appColors={appColors}>
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

          <WnaSectionTitle
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
                          if (
                            link.icon === "github" &&
                            project.repoVisibility === "private"
                          ) {
                            setIsPrivateRepoModalVisible(true);
                            return;
                          }

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
            </View>
          </View>
        </View>
        <Modal
          visible={isPrivateRepoModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsPrivateRepoModalVisible(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsPrivateRepoModalVisible(false)}
          >
            <Pressable
              onPress={() => undefined}
              style={[
                styles.modalDialog,
                {
                  backgroundColor: convertHexToRgba(appColors.coolgray8, 0.96),
                  borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[
                    appStyle.textNeutralMedium,
                    { color: appColors.white, fontWeight: "700" },
                  ]}
                >
                  {t(i18nKeys.titlePrivateRepo)}
                </Text>
                <Text
                  style={[
                    appStyle.textNeutralMedium,
                    { color: appColors.white, opacity: 0.92 },
                  ]}
                >
                  {t(i18nKeys.infoPrivateRepoHint)}
                </Text>
              </View>

              <View style={styles.modalBody}>
                <Text
                  style={[
                    appStyle.textNeutralMedium,
                    { color: appColors.white, opacity: 0.86 },
                  ]}
                >
                  {t(i18nKeys.infoPrivateRepoBody)}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <WnaButtonIconText
                  appColors={appColors}
                  appStyle={appStyle}
                  iconName="email"
                  text={t(i18nKeys.actionEmail)}
                  textColor={appColors.white}
                  backgroundColor={convertHexToRgba(appColors.accent5, 0.92)}
                  borderWidth={1}
                  style={{
                    ...styles.actionButton,
                    borderColor: convertHexToRgba(appColors.coolgray2, 0.4),
                    marginHorizontal: 0,
                  }}
                  onPress={() => {
                    setIsPrivateRepoModalVisible(false);
                    Linking.openURL(privateRepoMailToUrl);
                  }}
                />
                <WnaButtonIconText
                  appColors={appColors}
                  appStyle={appStyle}
                  iconName="github"
                  text={t(i18nKeys.actionContinueToPage)}
                  textColor={appColors.white}
                  backgroundColor={convertHexToRgba(appColors.coolgray8, 0.98)}
                  borderWidth={1}
                  style={{
                    ...styles.actionButton,
                    borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
                    marginHorizontal: 0,
                  }}
                  onPress={() => {
                    setIsPrivateRepoModalVisible(false);
                    Linking.openURL(project.repoUrl ?? "");
                  }}
                />
                <WnaButtonIconText
                  appColors={appColors}
                  appStyle={appStyle}
                  iconName="close"
                  text={t(i18nKeys.actionClose)}
                  textColor={appColors.white}
                  backgroundColor={convertHexToRgba(appColors.coolgray8, 0.98)}
                  borderWidth={1}
                  style={{
                    ...styles.actionButton,
                    borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
                    marginHorizontal: 0,
                  }}
                  onPress={() => setIsPrivateRepoModalVisible(false)}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </WnaSurfaceCard>
    </WnaScrollViewScreen>
  );
}
