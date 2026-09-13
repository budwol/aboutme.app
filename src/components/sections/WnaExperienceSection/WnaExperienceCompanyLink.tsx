import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Linking } from "@utils/webLinking";
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

  return (
    <Pressable
      accessibilityRole="link"
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPress={(event) => {
        event.stopPropagation();
        void Linking.openURL(companyUrl);
      }}
      style={[
        styles.companyLinkPressable,
        isHovered && {
          backgroundColor: convertHexToRgba(appColors.accent5, 0.08),
        },
      ]}
      testID={`experience-company-link-${index}`}
    >
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
    </Pressable>
  );
}
