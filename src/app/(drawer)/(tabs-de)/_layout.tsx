import WnaTabLayout from "@components/navigation/WnaTabLayout";
import { tabScreenConfigDe } from "@components/navigation/wnaTabLayoutConfig";

export default function TabLayout() {
  return <WnaTabLayout screens={tabScreenConfigDe} />;
}
