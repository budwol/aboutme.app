import WnaSectionTitle from "@components/text/WnaSectionTitle";
import WnaPressable from "@components/buttons/WnaPressable";
import WnaSectionFooterAction from "@components/sections/WnaSectionFooterAction";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { getProjectImageForWidth } from "@components/images/wnaImageAssetResolver";
import { appLayoutConstants } from "@constants/layoutConstants";
import { sectionConstants } from "@constants/sectionConstants";
import { convertHexToRgba } from "@utils/colorConverter";
import { StyleSheet, Text, View } from "react-native";
import WnaCardVerticalWithImage from "@components/cards/WnaCardVerticalWithImage";
import { WnaSectionProps } from "@components/sections/WnaSectionProps";
import { i18nKeys } from "@/i18n/i18nKeys";

const styles = StyleSheet.create({
  footerActionWrap: {
    marginTop: sectionConstants.sectionFooterActionMarginTop,
  },
  projectItemFeatured: {
    width:
      sectionConstants.projectsCardWidth * 2 +
      sectionConstants.projectsCardGridGap,
  },
  highlightsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
});

export type WnaProjectsCardProps = WnaSectionProps & {
  onProjectPress?: (index: number) => void;
  onShowMorePress?: () => void;
};

export default function WnaProjectsCard({
  appColors,
  appData,
  appStyle,
  t,
  onProjectPress,
  onShowMorePress,
}: WnaProjectsCardProps) {
  const cardWidth = sectionConstants.projectsCardWidth;
  const cardHeight = cardWidth * 0.5;
  const cardContentMinHeight = 78;
  return (
    <View
      style={{
        width: "100%",
        gap: appLayoutConstants.contentSectionGap,
        paddingVertical: appLayoutConstants.contentSectionPaddingVertical,
      }}
    >
      <WnaSectionTitle
        appColors={appColors}
        appStyle={appStyle}
        title={t(i18nKeys.screenTitleProjects)}
        subtitle={(appData.projectsSubtitle ?? "").toUpperCase()}
      />

      {appData.projectsContext ? (
        <View
          style={{
            paddingHorizontal:
              sectionConstants.projectsContextPaddingHorizontal,
            paddingVertical: sectionConstants.projectsContextPaddingVertical,
            borderWidth: 1,
            borderRadius: appLayoutConstants.globalCornerRadius,
            backgroundColor: convertHexToRgba(appColors.warmgray6, 0.16),
            borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
          }}
        >
          <Text
            style={[
              appStyle.textSmall,
              {
                fontStyle: "italic",
                fontWeight: "400",
                lineHeight: (appStyle.textSmall?.lineHeight ?? 16) + 4,
                opacity: sectionConstants.projectsContextOpacity,
              },
            ]}
          >
            {appData.projectsContext}
          </Text>
        </View>
      ) : null}

      {appData.projectsHighlights.length > 0 ? (
        <View style={styles.highlightsWrap}>
          {appData.projectsHighlights.map((item, index) => (
            <View
              key={`home-project-highlight-${item.icon}-${item.text}-${index}`}
              style={[
                styles.highlightItem,
                {
                  backgroundColor: convertHexToRgba(appColors.warmgray6, 0.2),
                  borderColor: convertHexToRgba(appColors.coolgray2, 0.5),
                },
              ]}
            >
              <WnaIcon
                iconName={item.icon as never}
                size={16}
                color={appColors.black}
              />
              <Text style={[appStyle.textSmall, { color: appColors.black }]}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: sectionConstants.projectsCardGridGap,
        }}
      >
        {appData.projects.map((project, index) => (
          <View
            key={`${project.title}-${index}`}
            style={index === 0 ? styles.projectItemFeatured : undefined}
          >
            <WnaPressable
              ripple={appColors.isDark ? "light" : "dark"}
              checkInternetConnection={false}
              t={t}
              onPress={() => onProjectPress?.(index)}
            >
              <WnaCardVerticalWithImage
                contentMinHeight={cardContentMinHeight}
                height={cardHeight}
                width={
                  index === 0
                    ? cardWidth * 2 + sectionConstants.projectsCardGridGap
                    : cardWidth
                }
                appColors={appColors}
                appStyle={appStyle}
                imageUrl={`images/${getProjectImageForWidth(
                  project,
                  index === 0
                    ? cardWidth * 2 + sectionConstants.projectsCardGridGap
                    : cardWidth,
                )}`}
                text1={project.title}
                text2={project.subtitle}
              />
            </WnaPressable>
          </View>
        ))}
      </View>

      {onShowMorePress ? (
        <View style={styles.footerActionWrap}>
          <WnaSectionFooterAction
            appColors={appColors}
            appStyle={appStyle}
            label={t(i18nKeys.actionShowMore)}
            onPress={onShowMorePress}
          />
        </View>
      ) : null}
    </View>
  );
}
