import WnaButtonIcon from "@components/buttons/WnaButtonIcon";
import WnaButtonIconText from "@components/buttons/WnaButtonIconText";
import WnaHeroImage from "@components/images/WnaHeroImage";
import { getProjectImageForWidth } from "@components/images/wnaImageAssetResolver";
import { convertHexToRgba } from "@utils/colorConverter";
import { ReactNode } from "react";
import { Text, View } from "react-native";
import type { TFunction } from "i18next";
import { styles } from "./styles";
import type {
  WnaProjectDetailsProject,
  WnaProjectDetailsThemeProps,
  WnaProjectLink,
} from "./types";

type WnaProjectHeroProps = WnaProjectDetailsThemeProps & {
  currentWindowWidth: number;
  isLandscape: boolean;
  project: WnaProjectDetailsProject;
  projectLinks: WnaProjectLink[];
  t: TFunction<"common">;
  onProjectLinkPress: (link: WnaProjectLink) => void;
};

function WnaProjectHeroBadge({
  appColors,
  appStyle,
  subtitle,
}: WnaProjectDetailsThemeProps & {
  subtitle: string;
}): ReactNode {
  return (
    <View
      style={[
        styles.heroBadge,
        {
          backgroundColor: convertHexToRgba(appColors.staticCoolgray8, 0.8),
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
        {subtitle}
      </Text>
    </View>
  );
}

export default function WnaProjectHero({
  appColors,
  appStyle,
  currentWindowWidth,
  isLandscape,
  onProjectLinkPress,
  project,
  projectLinks,
  t,
}: WnaProjectHeroProps): ReactNode {
  return (
    <View style={styles.heroSection}>
      {project.subtitle && isLandscape ? (
        <View style={styles.heroBadgeContainer}>
          <WnaProjectHeroBadge
            appColors={appColors}
            appStyle={appStyle}
            subtitle={project.subtitle}
          />
        </View>
      ) : null}

      {!isLandscape && (project.subtitle || projectLinks.length > 0) ? (
        <View style={styles.heroBottomLeftStack}>
          {projectLinks.length > 0 ? (
            <View style={styles.actionSection}>
              <View style={styles.actionLinks}>
                {projectLinks.map((link) => (
                  <WnaButtonIcon
                    key={link.label}
                    appColors={appColors}
                    appStyle={appStyle}
                    iconName={link.icon}
                    toolTip={link.label}
                    toolTipPosition="top"
                    t={t}
                    checkInternetConnection={false}
                    onPress={() => onProjectLinkPress(link)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {project.subtitle ? (
            <WnaProjectHeroBadge
              appColors={appColors}
              appStyle={appStyle}
              subtitle={project.subtitle}
            />
          ) : null}
        </View>
      ) : null}

      {projectLinks.length > 0 && isLandscape ? (
        <View style={[styles.heroActionContainer]}>
          <View style={styles.actionSection}>
            <View style={styles.actionLinks}>
              {projectLinks.map((link) =>
                /* istanbul ignore next -- isLandscape can't flip mid-map; the outer condition already guards this block to isLandscape === true */
                isLandscape ? (
                  <WnaButtonIconText
                    key={link.label}
                    appColors={appColors}
                    appStyle={appStyle}
                    iconName={link.icon}
                    text={link.label}
                    textColor={appColors.staticWhite}
                    backgroundColor={convertHexToRgba(
                      appColors.staticCoolgray8,
                      0.96,
                    )}
                    borderWidth={1}
                    style={{
                      ...styles.actionButton,
                      borderColor: convertHexToRgba(
                        appColors.staticCoolgray2,
                        0.72,
                      ),
                    }}
                    onPress={() => onProjectLinkPress(link)}
                  />
                ) : null,
              )}
            </View>
          </View>
        </View>
      ) : null}

      <WnaHeroImage
        appColors={appColors}
        imageUrl={`images/${getProjectImageForWidth(project, currentWindowWidth)}`}
        imageTitle={project.title}
      />
    </View>
  );
}
