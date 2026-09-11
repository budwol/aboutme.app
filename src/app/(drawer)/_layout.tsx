import { useWnaTheme } from "@/state/WnaAppContext";
import { Drawer } from "expo-router/drawer";
import WnaDrawerMenu from "@/navigation/components/WnaDrawerMenu";

export default function DrawerLayout() {
  const { appColors } = useWnaTheme();
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        drawerPosition: "right",
        overlayColor: "rgba(0,0,0,0.7)",
        drawerStyle: {
          width: 300,
          backgroundColor: appColors.isDark
            ? appColors.staticCoolgray8
            : appColors.white,
        },
      }}
      drawerContent={() => <WnaDrawerMenu />}
    >
      <Drawer.Screen name="(tabs-de)" options={{ headerShown: false }} />
      <Drawer.Screen name="(tabs-en)" options={{ headerShown: false }} />
    </Drawer>
  );
}
