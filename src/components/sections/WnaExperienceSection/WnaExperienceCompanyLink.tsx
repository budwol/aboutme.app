import React, { useState } from "react";
import { Text, View } from "react-native";
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
      testID: `experience-company-link-${index}`,
    },
    <View>
      <View style={styles.companyLinkRow}>
        <Text
          style={[
            appStyle.textNeutralSmall,
            styles.companyLinkText,
            isHovered && { color: appColors.accent5 },
            {
              textDecorationColor: convertHexToRgba(appColors.accent5, 0.45),
            },
          ]}
        >
          {company}
        </Text>
        <WnaIcon
          iconName="open-in-new"
          size={12}
          color={
            isHovered
              ? appColors.accent5
              : convertHexToRgba(appColors.accent5, 0.72)
          }
          style={styles.companyLinkIcon}
        />
      </View>
    </View>,
  );
}
