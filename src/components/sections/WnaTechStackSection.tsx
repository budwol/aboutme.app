import React, { CSSProperties } from "react";
import WnaBadge from "@components/display/WnaBadge";
import { convertHexToRgba } from "@utils/colorConverter";
import { WnaSectionProps } from "@components/sections/wnaSectionProps";
import { i18nKeys } from "@/i18n/i18nKeys";
import { appLayoutConstants } from "@constants/layoutConstants";

type WnaTechStackGroup = {
  key: string;
  title: string;
  stack: string[];
};

type WnaTechStackSectionProps = Pick<
  WnaSectionProps,
  "appColors" | "appData" | "appStyle" | "t"
> & {
  groups?: WnaTechStackGroup[];
};

export default function WnaTechStackSection({
  appColors,
  appData,
  appStyle,
  t,
  groups,
}: WnaTechStackSectionProps) {
  const groupGap = appLayoutConstants.globalListGap / 2;
  const resolvedGroups = groups ?? [
    {
      key: "primary",
      title: t(i18nKeys.titleTechstackPrimary),
      stack: appData?.techStack?.primary ?? [],
    },
    {
      key: "secondary",
      title: t(i18nKeys.titleTechStackSecondary),
      stack: appData?.techStack?.secondary ?? [],
    },
  ];

  const renderBadges = (stack: string[], groupKey: string) =>
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: 8,
        } as CSSProperties,
      },
      stack.map((tech) => (
        <WnaBadge
          key={`${groupKey}-${tech}`}
          text={tech}
          appColors={appColors}
          appStyle={appStyle}
        />
      )),
    );

  const renderGroupCard = (title: string, stack: string[], groupKey: string) =>
    React.createElement(
      "div",
      {
        key: groupKey,
        style: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 280,
          padding: 16,
          borderRadius: appLayoutConstants.globalCornerRadius,
          gap: 16,
          backgroundColor: convertHexToRgba(appColors.warmgray6, 0.2),
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: appColors.coolgray2,
        } as CSSProperties,
      },
      React.createElement(
        "span",
        {
          style: {
            ...appStyle.textNeutralTitleLarge,
            textTransform: "uppercase",
            color: appColors.coolgray8,
            letterSpacing: 1,
          } as CSSProperties,
        },
        title,
      ),
      renderBadges(stack, groupKey),
    );

  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "row",
        gap: groupGap,
        flexWrap: "wrap",
      } as CSSProperties,
    },
    resolvedGroups
      .filter((group) => group.stack.length > 0)
      .map((group) => renderGroupCard(group.title, group.stack, group.key)),
  );
}
