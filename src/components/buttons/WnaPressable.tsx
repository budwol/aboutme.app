import WnaBasePressable from "@components/buttons/WnaBasePressable/WnaBasePressable";
import { appLayoutConstants } from "@constants/layoutConstants";
import { TFunction } from "i18next";
import { FC, ReactNode, useRef, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Popable } from "react-native-popable";

export type WnaPressableState = Readonly<{
  pressed: boolean;
  hovered?: boolean;
  focused?: boolean;
}>;

export type WnaPressableProps = {
  children: ReactNode;
  onPress: () => void;
  checkInternetConnection?: boolean;
  t?: TFunction<string[], undefined>;
  toolTip?: string;
  toolTipPosition?: "top" | "right" | "bottom" | "left" | undefined;
  style?: ViewStyle | ViewStyle[];
  ripple: "light" | "dark" | undefined;
  disableHover?: boolean;
  disabled?: boolean;
};

const _toolTipZindex = 1000;

const WnaPressable: FC<WnaPressableProps> = (props) => {
  const [isToolTipVisible, setIsToolTipVisible] = useState(false);
  const toolTip = props.toolTip ?? "";
  const toolTipPosition = props.toolTipPosition;
  const [isEnabled, setIsEnabled] = useState(true);
  const isEnabledRef = useRef(true);
  const onPress = async () => {
    if (!isEnabledRef.current) return;

    setIsEnabled(false);
    isEnabledRef.current = false;

    props.onPress();

    setTimeout(() => {
      setIsEnabled(true);
      isEnabledRef.current = true;
    }, 500);
  };
  const toolTipStyle = {
    zIndex: _toolTipZindex,
    pointerEvents: "none",
  } as ViewStyle;

  const toolTipStyleTop = [
    toolTipStyle,
    {
      position: "absolute",
      bottom: "100%",
      zIndex: _toolTipZindex,
    },
  ] as ViewStyle[];

  const toolTipStyleLeft = [
    toolTipStyle,
    {
      position: "absolute",
      top: appLayoutConstants.headerButtonHeight / 2,
      right: appLayoutConstants.headerButtonHeight,
    },
  ] as ViewStyle[];

  const toolTipStyleBottom = [toolTipStyle] as ViewStyle[];
  return (
    <>
      {toolTip &&
        toolTip !== "" &&
        toolTipPosition &&
        (toolTipPosition === "left" || toolTipPosition === "top") && (
          <Popable
            content={toolTip}
            position={toolTipPosition}
            visible={isToolTipVisible}
            style={
              props.toolTipPosition === "top"
                ? toolTipStyleTop
                : toolTipStyleLeft
            }
          >
            {null}
          </Popable>
        )}
      <View style={[{ overflow: "hidden" }, props.style]}>
        <WnaBasePressable
          ripple={props.ripple}
          onPress={onPress}
          isEnabled={isEnabled}
          onHoverIn={() => setIsToolTipVisible(true)}
          onHoverOut={() => setIsToolTipVisible(false)}
          disableHover={props.disableHover}
          checkInternetConnection={props.checkInternetConnection}
        >
          {props.children}
        </WnaBasePressable>
      </View>
      {toolTip &&
        toolTip !== "" &&
        toolTipPosition &&
        (toolTipPosition === "bottom" || toolTipPosition === "right") && (
          <Popable
            content={toolTip}
            position={props.toolTipPosition}
            visible={isToolTipVisible}
            style={
              toolTipPosition === "bottom"
                ? toolTipStyleBottom
                : toolTipStyleBottom
            }
          >
            {null}
          </Popable>
        )}
    </>
  );
};
export default WnaPressable;
