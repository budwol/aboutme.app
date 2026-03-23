import WnaTabLayout from "@/navigation/components/WnaTabLayout";
import { tabScreenConfigDe } from "@/navigation/config/wnaTabLayoutConfig";

export default function TabLayout() {
  return <WnaTabLayout screens={tabScreenConfigDe} />;
}
