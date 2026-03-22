import { appLayoutConstants } from "@constants/layoutConstants";
import { convertHexToRgba } from "@utils/colorConverter";
import { FC, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WnaWelcomeProps } from "@components/welcome/WnaWelcomeProps";

type WnaSectionFooterActionProps = Pick<
  WnaWelcomeProps,
  "appColors" | "appStyle"
> & {
  label: string;
  onPress: () => void;
};

const styles = StyleSheet.create({
  footerActionRow: {
    alignItems: "center",
  },
  footerActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
  },
  footerActionButtonText: {
    fontWeight: "600",
  },
});

const WnaSectionFooterAction: FC<WnaSectionFooterActionProps> = ({
  appColors,
  appStyle,
  label,
  onPress,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const surfaceColor = useMemo(
    () => convertHexToRgba(appColors.accent5, 0.08),
    [appColors.accent5],
  );
  const borderColor = useMemo(
    () => convertHexToRgba(appColors.accent5, 0.25),
    [appColors.accent5],
  );
  const hoverBorderColor = useMemo(
    () => convertHexToRgba(appColors.accent5, 0.38),
    [appColors.accent5],
  );

  return (
    <View style={styles.footerActionRow}>
      <Pressable
        onPress={onPress}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={[
          styles.footerActionButton,
          {
            borderColor: isHovered ? hoverBorderColor : borderColor,
            backgroundColor: isHovered
              ? convertHexToRgba(appColors.accent5, 0.14)
              : surfaceColor,
          },
        ]}
      >
        <Text
          style={[
            appStyle.textMicro,
            styles.footerActionButtonText,
            { color: appColors.accent5 },
          ]}
        >
          {label} →
        </Text>
      </Pressable>
    </View>
  );
};

export default WnaSectionFooterAction;
