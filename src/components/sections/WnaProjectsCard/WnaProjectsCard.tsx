import WnaSectionTitle from "@components/text/WnaSectionTitle";
import WnaPressable from "@components/buttons/WnaPressable";
import WnaSectionFooterAction from "@components/sections/WnaSectionFooterAction";
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

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: sectionConstants.projectsCardGridGap,
        }}
      >
        {appData.projects.map((project, index) => (
          <View key={`${project.title}-${index}`}>
            <WnaPressable
              ripple={appColors.isDark ? "light" : "dark"}
              checkInternetConnection={false}
              t={t}
              onPress={() => onProjectPress?.(index)}
            >
              <WnaCardVerticalWithImage
                width={cardWidth}
                appColors={appColors}
                appStyle={appStyle}
                imageUrl={`images/${project.imageS}`}
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
    </View>
  );
}
