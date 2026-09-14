import React, { CSSProperties, useState } from "react";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { convertHexToRgba } from "@utils/colorConverter";
import { styles } from "./wnaExperienceSectionStyles";
import { WnaExperienceSharedProps } from "./wnaExperienceSectionTypes";

type WnaExperienceCompanyLinkProps = Pick<
  WnaExperienceSharedProps,
  "appColors" | "appStyle"
> & {
  company: string;
  companyUrl: string;
  index: number;
};

export default function WnaExperienceCompanyLink({
  appColors,
  appStyle,
  company,
  companyUrl,
  index,
}: WnaExperienceCompanyLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  const linkStyle = {
    ...styles.companyLinkPressable,
    color: "inherit",
    cursor: "pointer",
    display: "block",
    textDecoration: "none",
    ...(isHovered && {
      backgroundColor: convertHexToRgba(appColors.accent5, 0.08),
    }),
  };

  return React.createElement(
    "a",
    {
      href: companyUrl,
      target: "_blank",
      rel: "noreferrer",
      "aria-label": company,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onClick: (event: React.MouseEvent<HTMLAnchorElement>) =>
        event.stopPropagation(),
      style: linkStyle as React.CSSProperties,
      "data-testid": `experience-company-link-${index}`,
    },
    React.createElement(
      "div",
      { style: styles.companyLinkRow as CSSProperties },
      React.createElement(
        "span",
        {
          style: {
            ...appStyle.textNeutralSmall,
            ...styles.companyLinkText,
            ...(isHovered && { color: appColors.accent5 }),
            textDecorationColor: convertHexToRgba(appColors.accent5, 0.45),
          } as CSSProperties,
        },
        company,
      ),
      <WnaIcon
        iconName="open-in-new"
        size={12}
        color={
          isHovered
            ? appColors.accent5
            : convertHexToRgba(appColors.accent5, 0.72)
        }
        style={styles.companyLinkIcon}
      />,
    ),
  );
}
