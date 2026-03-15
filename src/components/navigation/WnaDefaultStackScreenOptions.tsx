import { useWnaTheme } from "@components/WnaAppContext";
import { FontFamilies } from "@constants/theme/fontFamilies";
import { convertHexToRgba } from "@utils/colorConverter";
import { Stack } from "expo-router";

export default function WnaDefaultStackScreenOptions() {
  const { appColors } = useWnaTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: "...",
        headerStyle: {
          backgroundColor: convertHexToRgba(appColors.staticBlack, 0.7),
        },
        headerTitleStyle: { fontFamily: FontFamilies.UI },
        headerTintColor: appColors.staticWhite,
        headerShadowVisible: false,
      }}
    />
  );
}
