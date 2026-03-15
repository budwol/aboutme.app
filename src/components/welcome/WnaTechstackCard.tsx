import { Text, View } from "react-native";
import WnaBadge from "../misc/WnaBadge";
import { convertHexToRgba } from "@utils/colorConverter";
import { WnaWelcomeProps } from "@components/welcome/WnaWelcomeProps";
import { i18nKeys } from "@services/i18n/i18nKeys";
import { appLayoutConstants } from "@constants/layoutConstants";

export default function WnaTechStackCard({
  appColors,
  appData,
  appStyle,
  t,
}: WnaWelcomeProps) {
  const primaryStack = appData?.techStack?.primary ?? [];
  const secondaryStack = appData?.techStack?.secondary ?? [];

  const renderTechGroup = (stack: string[], groupKey: string) => (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {stack.map((tech) => (
        <WnaBadge
          key={`${groupKey}-${tech}`}
          text={tech}
          appColors={appColors}
          appStyle={appStyle}
        />
      ))}
    </View>
  );

  const renderCard = (title: string, stack: string[], groupKey: string) => (
    <View
      style={{
        flex: 1,
        minWidth: 280,
        padding: 16,
        borderRadius: appLayoutConstants.globalCornerRadius,
        gap: 16,
        backgroundColor: convertHexToRgba(appColors.warmgray6, 0.2),
        borderWidth: 1,
        borderColor: appColors.coolgray2,
      }}
    >
      <Text
        style={[
          appStyle.textNeutralTitleLarge,
          {
            textTransform: "uppercase",
            color: appColors.coolgray8,
            letterSpacing: 1,
          },
        ]}
      >
        {title}
      </Text>

      {renderTechGroup(stack, groupKey)}
    </View>
  );

  return (
    <View
      style={{
        flexDirection: "row",
        gap: appLayoutConstants.globalListGap,
        flexWrap: "wrap",
      }}
    >
      {renderCard(t(i18nKeys.titleTechstackPrimary), primaryStack, "primary")}

      {renderCard(
        t(i18nKeys.titleTechStackSecondary),
        secondaryStack,
        "secondary",
      )}
    </View>
  );
}
