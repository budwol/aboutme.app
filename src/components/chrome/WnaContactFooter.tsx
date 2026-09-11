import { useWnaAppData, useWnaTheme } from "@/state/WnaAppContext";
import WnaSeparatorHorizontal from "@components/display/WnaSeparatorHorizontal";
import WnaContactSection from "@components/sections/WnaContactSection";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  footer: {
    marginBottom: 24,
  },
});

type WnaContactFooterProps = {
  showTopSpacing?: boolean;
};

const WnaContactFooter = memo(
  ({ showTopSpacing = true }: WnaContactFooterProps) => {
    const { appColors, appStyle } = useWnaTheme();
    const { appData } = useWnaAppData();
    const { t } = useTranslation(["common"]);

    return (
      <View style={styles.footer}>
        {showTopSpacing && <WnaSeparatorHorizontal transparent space={16} />}
        <WnaContactSection
          appColors={appColors}
          appData={appData}
          appStyle={appStyle}
          t={t}
        />
      </View>
    );
  },
);

WnaContactFooter.displayName = "WnaContactFooter";

export default WnaContactFooter;
