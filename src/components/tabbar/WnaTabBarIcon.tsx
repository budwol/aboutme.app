import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import Colors from "@constants/theme/colors";

export default function WnaTabBarIcon({
  focused,
  iconName,
  appColors,
}: {
  focused: boolean;
  iconName: keyof typeof iconMap;
  appColors: Colors;
}) {
  const clr = focused ? appColors.accent4 : appColors.coolgray4;
  const iconSize = focused ? 24 : 20;
  return <WnaIcon iconName={iconName} size={iconSize} color={clr} />;
}
