import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { WnaHyperLinkTextProps } from "@components/text/WnaHyperLinkText/WnaHyperLinkTextProps";
import { FC, memo, useState } from "react";
import { Pressable, Text } from "react-native";

const WnaHyperLinkTextComponent: FC<WnaHyperLinkTextProps> = ({
  appStyle,
  appColors,
  text,
  onHyperLinkClick,
  isExternal,
  bold,
  textTransform,
}) => {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  let color = appColors.coolgray7;
  let underlineColor = appColors.coolgray4;

  if (hover) {
    color = appColors.coolgray8;
    underlineColor = appColors.coolgray6;
  }

  if (active) {
    color = appColors.coolgray7;
    underlineColor = appColors.coolgray5;
  }

  return (
    <Pressable
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPressIn={() => setActive(true)}
      onPressOut={() => setActive(false)}
      onPress={onHyperLinkClick}
      style={{
        flexDirection: "row",
        alignSelf: "baseline",
        alignItems: "baseline",
        cursor: "pointer",
      }}
    >
      <Text
        style={[
          appStyle.textNeutralMedium,
          {
            fontWeight: bold ? "600" : "500",
            textTransform: textTransform ?? "none",
            color,
            textDecorationLine: "underline",
            textDecorationColor: underlineColor,
            textDecorationStyle: "solid",
          },
        ]}
      >
        {text}
        {isExternal && (
          <WnaIcon
            iconName="open-in-new"
            size={appStyle.textNeutralMedium.fontSize! - 2}
            style={{ marginLeft: 4, top: 1 }}
            color={color}
          />
        )}
      </Text>
    </Pressable>
  );
};

const WnaHyperLinkText = memo(WnaHyperLinkTextComponent);

WnaHyperLinkText.displayName = "WnaHyperLinkText";

export default WnaHyperLinkText;
