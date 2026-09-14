import { useWnaAppData, useWnaTheme } from "@/state/WnaAppContext";
import WnaSeparatorHorizontal from "@components/display/WnaSeparatorHorizontal";
import WnaContactSection from "@components/sections/WnaContactSection";
import React, { CSSProperties, memo } from "react";
import { useTranslation } from "react-i18next";

const styles = {
  footer: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 24,
  },
} satisfies Record<string, CSSProperties>;

type WnaContactFooterProps = {
  showTopSpacing?: boolean;
};

const WnaContactFooter = memo(
  ({ showTopSpacing = true }: WnaContactFooterProps) => {
    const { appColors, appStyle } = useWnaTheme();
    const { appData } = useWnaAppData();
    const { t } = useTranslation(["common"]);

    return React.createElement(
      "div",
      { style: styles.footer },
      showTopSpacing && <WnaSeparatorHorizontal transparent space={16} />,
      <WnaContactSection
        appColors={appColors}
        appData={appData}
        appStyle={appStyle}
        t={t}
      />,
    );
  },
);

WnaContactFooter.displayName = "WnaContactFooter";

export default WnaContactFooter;
