import WnaTabLayout from "@components/navigation/WnaTabLayout";
import { tabScreenConfigEn } from "@components/navigation/wnaTabLayoutConfig";

export default function TabLayout() {
  return <WnaTabLayout screens={tabScreenConfigEn} />;
}
