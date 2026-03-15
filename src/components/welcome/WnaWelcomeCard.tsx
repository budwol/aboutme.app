import WnaWelcomeTitle from "@components/text/WnaWelcomeTitle";
import { Text, View } from "react-native";
import WnaImage from "@components/images/WnaImage";
import { WnaWelcomeProps } from "@components/welcome/WnaWelcomeProps";
import WnaTechStackCard from "@components/welcome/WnaTechstackCard";
import { appLayoutConstants } from "@constants/layoutConstants";

export default function WnaWelcomeCard({
  appColors,
  appData,
  appStyle,
  t,
}: WnaWelcomeProps) {
  return (
    <View style={{ width: "100%", gap: 24 }}>
      <View style={{ alignItems: "center", height: 128, marginTop: 16 }}>
        <WnaImage
          appColors={appColors}
          imageUrl={`images/${appData.profile.avatar}`}
          imageTitle={"Avatar"}
          style={{
            width: 128,
            height: 128,
            borderRadius: 64,
            backgroundColor: appColors.white,
            borderWidth: 1,
            borderColor: appColors.coolgray2,
          }}
        />
      </View>

      <WnaWelcomeTitle
        appColors={appColors}
        appStyle={appStyle}
        title={appData.profile.name}
        subtitle={appData.profile.title.toUpperCase()}
      />

      <View
        style={{ gap: appLayoutConstants.globalListGap, paddingVertical: 8 }}
      >
        {appData.profile.description.map((value, index) => {
          return (
            <Text
              key={`description-${index}`}
              style={appStyle.textNeutralMedium}
            >
              {value}
            </Text>
          );
        })}

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
