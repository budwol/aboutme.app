import WnaBasePressable from "@components/buttons/WnaBasePressable/WnaBasePressable";
import WnaTooltip from "@components/effects/WnaTooltip";
import { TFunction } from "i18next";
import { FC, ReactNode, useRef, useState } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

export type WnaPressableState = Readonly<{
  pressed: boolean;
  hovered?: boolean;
  focused?: boolean;
}>;

export type WnaPressableProps = {
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
  checkInternetConnection?: boolean;
  t?: TFunction<string[], undefined>;
  toolTip?: string;
  toolTipPosition?: "top" | "right" | "bottom" | "left" | undefined;
  style?: ViewStyle | ViewStyle[];
  baseStyle?: ViewStyle | ViewStyle[];
  ripple: "light" | "dark" | undefined;
  disableHover?: boolean;
  disabled?: boolean;
};

const WnaPressable: FC<WnaPressableProps> = (props) => {
  const [isToolTipVisible, setIsToolTipVisible] = useState(false);
  const toolTip = props.toolTip ?? "";
  const toolTipPosition = props.toolTipPosition;
  const [isEnabled, setIsEnabled] = useState(true);
  const isEnabledRef = useRef(true);
  const onPress = async () => {
    if (props.disabled || !isEnabledRef.current) return;

    setIsEnabled(false);
    isEnabledRef.current = false;

    props.onPress();

    setTimeout(() => {
      setIsEnabled(true);
      isEnabledRef.current = true;
    }, 500);
  };
  const hasTooltip = Boolean(toolTip && toolTipPosition);
  const flattenedStyle = StyleSheet.flatten(props.style);
  return (
    <View style={[{ overflow: "visible", position: "relative" }, props.style]}>
      {hasTooltip && (
        <WnaTooltip
          content={toolTip}
          position={toolTipPosition!}
          visible={isToolTipVisible}
        />
      )}
      <View
        style={{
          borderRadius: flattenedStyle?.borderRadius,
          flex: 1,
          overflow: "hidden",
        }}
      >
        <WnaBasePressable
          accessibilityLabel={props.accessibilityLabel}
          ripple={props.ripple}
          baseStyle={props.baseStyle}
          onPress={onPress}
          isEnabled={isEnabled && !props.disabled}
          onHoverIn={() => setIsToolTipVisible(true)}
          onHoverOut={() => setIsToolTipVisible(false)}
          disableHover={props.disableHover}
          checkInternetConnection={props.checkInternetConnection}
        >
          {props.children}
        </WnaBasePressable>
      </View>
    </View>
  );
};
export default WnaPressable;
