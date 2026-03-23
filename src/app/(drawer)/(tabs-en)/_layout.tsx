import WnaTabLayout from "@/navigation/components/WnaTabLayout";
import { tabScreenConfigEn } from "@/navigation/config/wnaTabLayoutConfig";

export default function TabLayout() {
  return <WnaTabLayout screens={tabScreenConfigEn} />;
}
