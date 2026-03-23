import { Text, View } from "react-native";
import { WnaSectionProps } from "@components/sections/WnaSectionProps";
import WnaTechStackCard from "@components/sections/WnaTechStackCard";
import { appLayoutConstants } from "@constants/layoutConstants";
import WnaProfileHero from "@components/sections/WnaProfileHero";

export default function WnaProfileCard({
  appColors,
  appData,
  appStyle,
  t,
}: WnaSectionProps) {
  return (
    <View style={{ width: "100%", gap: appLayoutConstants.contentSectionGap }}>
      <WnaProfileHero
        appColors={appColors}
        appData={appData}
        appStyle={appStyle}
      />

      <View
        style={{ gap: appLayoutConstants.globalListGap, paddingVertical: 8 }}
      >
        {appData.profile.description
          .split("\n")
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
          .map((value, index) => (
            <Text
              key={`description-${index}`}
              style={appStyle.textNeutralMedium}
            >
              {value}
            </Text>
          ))}

        <WnaTechStackCard
          appColors={appColors}
          appData={appData}
          appStyle={appStyle}
          t={t}
        />
      </View>
    </View>
  );
}
