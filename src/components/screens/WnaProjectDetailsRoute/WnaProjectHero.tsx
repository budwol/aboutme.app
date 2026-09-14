import WnaButtonIcon from "@components/buttons/WnaButtonIcon";
import WnaButtonIconText from "@components/buttons/WnaButtonIconText";
import WnaHeroImage from "@components/images/WnaHeroImage";
import { getProjectImageForWidth } from "@components/images/wnaImageAssetResolver";
import { convertHexToRgba } from "@utils/colorConverter";
import React, { CSSProperties, ReactNode } from "react";
import type { TFunction } from "i18next";
import { styles } from "./wnaProjectDetailsRouteStyles";
import type {
  WnaProjectDetailsProject,
  WnaProjectDetailsThemeProps,
  WnaProjectLink,
} from "./wnaProjectDetailsRouteTypes";

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
  return React.createElement(
    "div",
    {
      style: {
        ...styles.heroBadge,
        backgroundColor: convertHexToRgba(appColors.staticCoolgray8, 0.8),
        borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
      } as CSSProperties,
    },
    React.createElement(
      "span",
      {
        style: {
          ...appStyle.textSmall,
          color: appColors.staticWhite,
          lineHeight: "16px",
        } as CSSProperties,
      },
      subtitle,
    ),
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
  return React.createElement(
    "div",
    { style: styles.heroSection as CSSProperties },
    project.subtitle && isLandscape
      ? React.createElement(
          "div",
          { style: styles.heroBadgeContainer as CSSProperties },
          <WnaProjectHeroBadge
            appColors={appColors}
            appStyle={appStyle}
            subtitle={project.subtitle}
          />,
        )
      : null,

    !isLandscape && (project.subtitle || projectLinks.length > 0)
      ? React.createElement(
          "div",
          { style: styles.heroBottomLeftStack as CSSProperties },
          projectLinks.length > 0
            ? React.createElement(
                "div",
                { style: styles.actionSection as CSSProperties },
                React.createElement(
                  "div",
                  { style: styles.actionLinks as CSSProperties },
                  projectLinks.map((link) => (
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
                  )),
                ),
              )
            : null,

          project.subtitle ? (
            <WnaProjectHeroBadge
              appColors={appColors}
              appStyle={appStyle}
              subtitle={project.subtitle}
            />
          ) : null,
        )
      : null,

    projectLinks.length > 0 && isLandscape
      ? React.createElement(
          "div",
          { style: styles.heroActionContainer as CSSProperties },
          React.createElement(
            "div",
            { style: styles.actionSection as CSSProperties },
            React.createElement(
              "div",
              { style: styles.actionLinks as CSSProperties },
              projectLinks.map((link) =>
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
              ),
            ),
          ),
        )
      : null,

    <WnaHeroImage
      appColors={appColors}
      imageUrl={`images/${getProjectImageForWidth(project, currentWindowWidth)}`}
      imageTitle={project.title}
    />,
  );
}
