import WnaWelcomeTitle from "@components/text/WnaWelcomeTitle";
import WnaPressable from "@components/buttons/WnaPressable";
import { appLayoutConstants } from "@constants/layoutConstants";
import { convertHexToRgba } from "@utils/colorConverter";
import { Text, View } from "react-native";
import WnaCardVerticalWithImage from "../cards/WnaCardVerticalWithImage";
import { WnaWelcomeProps } from "@components/welcome/WnaWelcomeProps";
import { i18nKeys } from "@services/i18n/i18nKeys";

export type WnaProjectsCardProps = WnaWelcomeProps & {
  onProjectPress?: (index: number) => void;
};

export default function WnaProjectsCard({
  appColors,
  appData,
  appStyle,
  t,
  onProjectPress,
}: WnaProjectsCardProps) {
  const _btnWidth = 256;
  return (
    <View
      style={{
        width: "100%",
        gap: appLayoutConstants.contentSectionGap,
        paddingVertical: appLayoutConstants.contentSectionPaddingVertical,
      }}
    >
      <WnaWelcomeTitle
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
          gap: 16,
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
                width={_btnWidth}
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

      {appData.projectsContext ? (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
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
                opacity: 0.78,
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
