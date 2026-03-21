import { Text, View } from "react-native";
import WnaBadge from "../misc/WnaBadge";
import { convertHexToRgba } from "@utils/colorConverter";
import { WnaWelcomeProps } from "@components/welcome/WnaWelcomeProps";
import { i18nKeys } from "@services/i18n/i18nKeys";
import { appLayoutConstants } from "@constants/layoutConstants";

type WnaTechStackGroup = {
  key: string;
  title: string;
  stack: string[];
};

type WnaTechStackCardProps = Pick<
  WnaWelcomeProps,
  "appColors" | "appData" | "appStyle" | "t"
> & {
  groups?: WnaTechStackGroup[];
};

export default function WnaTechStackCard({
  appColors,
  appData,
  appStyle,
  t,
  groups,
}: WnaTechStackCardProps) {
  const resolvedGroups = groups ?? [
    {
      key: "primary",
      title: t(i18nKeys.titleTechstackPrimary),
      stack: appData?.techStack?.primary ?? [],
    },
    {
      key: "secondary",
      title: t(i18nKeys.titleTechStackSecondary),
      stack: appData?.techStack?.secondary ?? [],
    },
  ];

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
      key={groupKey}
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
      {resolvedGroups
        .filter((group) => group.stack.length > 0)
        .map((group) => renderCard(group.title, group.stack, group.key))}
    </View>
  );
}
