import WnaPressable from "@components/buttons/WnaPressable";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { useWnaTheme } from "@components/WnaAppContext";
import { actionButtonRightConstants } from "@constants/layoutConstants";
import { StyleSheet, View, ViewStyle } from "react-native";

export type WnaButtonIconDecentProps = {
  iconName: keyof typeof iconMap;
  style?: ViewStyle | ViewStyle[];
  onPress: () => void;
};

const WnaButtonIconDecent = (props: WnaButtonIconDecentProps) => {
  const { iconName, onPress, style } = props;
  const { appColors } = useWnaTheme();
  return (
    <WnaPressable onPress={onPress} ripple={"light"}>
      <View style={[componentStyle.container, style]}>
        <WnaIcon iconName={iconName} size={24} color={appColors.accent5} />
      </View>
    </WnaPressable>
  );
};

const componentStyle = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    maxHeight: actionButtonRightConstants.size,
    height: actionButtonRightConstants.size,
    minWidth: 0,
  },
  icon: {
    padding: 10,
    margin: 0,
  },
});
export default WnaButtonIconDecent;
