import { convertHexToRgba } from "@utils/colorConverter";
import { ReactNode } from "react";
import { Text, View } from "react-native";
import { styles } from "./wnaProjectDetailsRouteStyles";
import type { WnaProjectDetailsThemeProps } from "./wnaProjectDetailsRouteTypes";

type WnaProjectDescriptionProps = WnaProjectDetailsThemeProps & {
  description: string;
};

function renderProjectDescription(
  description: string,
  appStyle: WnaProjectDetailsThemeProps["appStyle"],
) {
  const bodyTextStyle = {
    lineHeight: (appStyle.textNeutralMedium.lineHeight ?? 20) + 4,
  };
  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const nodes: ReactNode[] = [];
  let bulletLines: string[] = [];

  const flushBulletLines = () => {
    if (bulletLines.length === 0) {
      return;
    }

    nodes.push(
      <View
        key={`description-bullets-${nodes.length}`}
        style={styles.bulletGroup}
      >
        {bulletLines.map((line, index) => (
          <View key={`description-bullet-${index}`} style={styles.bulletRow}>
            <Text
              style={[
                appStyle.textNeutralMedium,
                bodyTextStyle,
                styles.bulletMarker,
              ]}
            >
              •
            </Text>
            <Text
              style={[
                appStyle.textNeutralMedium,
                bodyTextStyle,
                styles.bulletText,
              ]}
            >
              {line}
            </Text>
          </View>
        ))}
      </View>,
    );

    bulletLines = [];
  };

  for (const line of lines) {
    if (line.startsWith("- ")) {
      bulletLines.push(line.slice(2).trim());
      continue;
    }

    flushBulletLines();
    nodes.push(
      <Text
        key={`description-paragraph-${nodes.length}`}
        style={[appStyle.textNeutralMedium, bodyTextStyle]}
      >
        {line}
      </Text>,
    );
  }

  flushBulletLines();

  return nodes;
}

export default function WnaProjectDescription({
  appColors,
  appStyle,
  description,
}: WnaProjectDescriptionProps): ReactNode {
  return (
    <View
      style={[
        styles.descriptionSection,
        {
          backgroundColor: convertHexToRgba(appColors.warmgray6, 0.2),
          borderColor: convertHexToRgba(appColors.coolgray2, 0.9),
        },
      ]}
    >
      <View style={styles.descriptionGroup}>
        {renderProjectDescription(description, appStyle)}
      </View>
    </View>
  );
}
