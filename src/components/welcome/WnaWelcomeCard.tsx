import { Text, View } from "react-native";
import { WnaWelcomeProps } from "@components/welcome/WnaWelcomeProps";
import WnaTechStackCard from "@components/welcome/WnaTechstackCard";
import { appLayoutConstants } from "@constants/layoutConstants";
import WnaWelcomeHero from "@components/welcome/WnaWelcomeHero";

export default function WnaWelcomeCard({
  appColors,
  appData,
  appStyle,
  t,
}: WnaWelcomeProps) {
  return (
    <View style={{ width: "100%", gap: appLayoutConstants.contentSectionGap }}>
      <WnaWelcomeHero
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
