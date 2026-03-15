import WnaWelcomeTitle from "@components/text/WnaWelcomeTitle";
import { View } from "react-native";
import WnaCardVerticalWithImage from "../cards/WnaCardVerticalWithImage";
import { WnaWelcomeProps } from "@components/welcome/WnaWelcomeProps";
import { i18nKeys } from "@services/i18n/i18nKeys";

export default function WnaProjectsCard({
  appColors,
  appData,
  appStyle,
  t,
}: WnaWelcomeProps) {
  const _btnWidth = 256;
  return (
    <View style={{ width: "100%", gap: 24, paddingVertical: 16 }}>
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
          <View key={`${project.title}-${project}-${index}`}>
            <WnaCardVerticalWithImage
              width={_btnWidth}
              appColors={appColors}
              appStyle={appStyle}
              imageUrl={`images/${project.imageS}`}
              text1={project.title}
              text2={project.subtitle}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
