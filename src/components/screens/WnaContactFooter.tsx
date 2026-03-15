import { useWnaAppData, useWnaTheme } from "@components/WnaAppContext";
import WnaSeparatorHorizontal from "@components/misc/WnaSeparatorHorizontal";
import WnaContactCard from "@components/welcome/WnaContactCard";
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
        <WnaContactCard
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
