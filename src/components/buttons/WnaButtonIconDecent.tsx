import WnaPressable from "@components/buttons/WnaPressable";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { useWnaTheme } from "@components/WnaAppContext";
import { StyleSheet, View, ViewStyle } from "react-native";

export type WnaButtonIconDecentProps = {
  iconName: keyof typeof iconMap;
  style?: ViewStyle | ViewStyle[];
  onPress: () => void;
};

const WnaButtonIconDecent = (props: WnaButtonIconDecentProps) => {
  const { iconName, onPress } = props;
  const { appColors } = useWnaTheme();
  return (
    <WnaPressable onPress={onPress} ripple={"light"}>
      <View style={componentStyle.container}>
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
    maxHeight: 64,
    height: 64,
    minWidth: 0,
  },
  icon: {
    padding: 10,
    margin: 0,
  },
});
export default WnaButtonIconDecent;
