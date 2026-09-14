import React, { CSSProperties, memo, useMemo } from "react";

import WnaSeparatorHorizontal from "@components/display/WnaSeparatorHorizontal";
import AppStyle from "@/theme/appStyle";
import Colors from "@constants/theme/colors";
import WnaAccentBar from "@components/display/WnaAccentBar";

export interface WnaSectionTitleProps {
  appColors: Colors;
  appStyle: AppStyle;
  title: string;
  subtitle?: string;
  titleTextColor?: string;
  showAccentBar?: boolean;
  accentBarWidth?: number;
  accentBarPulseToWidth?: number;
  accentBarPulseDuration?: number;
}

const WnaSectionTitle = ({
  appColors,
  appStyle,
  title,
  subtitle,
  titleTextColor,
  showAccentBar = false,
  accentBarWidth = 112,
  accentBarPulseToWidth,
  accentBarPulseDuration,
}: WnaSectionTitleProps) => {
  const titleStyle = useMemo(
    () =>
      ({
        ...appStyle.textExtraLarge,
        ...styles.title,
        color: titleTextColor ?? appColors.black,
      }) as CSSProperties,
    [appStyle, titleTextColor, appColors.black],
  );

  const subtitleComponent = useMemo(() => {
    if (!subtitle) return null;

    return (
      <>
        <WnaSeparatorHorizontal transparent space={showAccentBar ? 10 : 8} />
        {showAccentBar ? (
          <WnaAccentBar
            appColors={appColors}
            width={accentBarWidth}
            pulseToWidth={accentBarPulseToWidth}
            pulseDuration={accentBarPulseDuration}
          />
        ) : null}
        {showAccentBar ? (
          <WnaSeparatorHorizontal transparent space={10} />
        ) : null}
        {React.createElement(
          "span",
          { style: appStyle.textNeutralSubtitle as CSSProperties },
          subtitle,
        )}
        <WnaSeparatorHorizontal transparent space={8} />
      </>
    );
  }, [
    accentBarPulseDuration,
    accentBarPulseToWidth,
    accentBarWidth,
    appColors,
    appStyle,
    showAccentBar,
    subtitle,
  ]);

  return React.createElement(
    "div",
    { style: styles.container },
    React.createElement("span", { style: titleStyle }, title),
    subtitleComponent,
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  title: {
    letterSpacing: 2,
    textAlign: "center",
  },
} satisfies Record<string, CSSProperties>;

export default memo(WnaSectionTitle);
