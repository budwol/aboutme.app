import React, { CSSProperties } from "react";
import { WnaSectionProps } from "@components/sections/wnaSectionProps";
import WnaTechStackSection from "@components/sections/WnaTechStackSection";
import { appLayoutConstants } from "@constants/layoutConstants";
import WnaProfileHero from "@components/sections/WnaProfileHero";

export default function WnaProfileSection({
  appColors,
  appData,
  appStyle,
  t,
}: WnaSectionProps) {
  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: appLayoutConstants.contentSectionGap,
      } as CSSProperties,
    },
    <WnaProfileHero
      appColors={appColors}
      appData={appData}
      appStyle={appStyle}
    />,
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: appLayoutConstants.globalListGap,
          paddingBlock: 8,
        } as CSSProperties,
      },
      appData.profile.description
        .split("\n")
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
        .map((value, index) =>
          React.createElement(
            "span",
            {
              key: `description-${index}`,
              style: appStyle.textNeutralMedium as CSSProperties,
            },
            value,
          ),
        ),
      <WnaTechStackSection
        appColors={appColors}
        appData={appData}
        appStyle={appStyle}
        t={t}
      />,
    ),
  );
}
