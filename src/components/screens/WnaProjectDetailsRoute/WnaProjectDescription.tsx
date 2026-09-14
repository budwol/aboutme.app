import { convertHexToRgba } from "@utils/colorConverter";
import { addToLineHeight } from "@utils/addToLineHeight";
import React, { CSSProperties, ReactNode } from "react";
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
    lineHeight: addToLineHeight(appStyle.textNeutralMedium.lineHeight, 4, 20),
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
      React.createElement(
        "div",
        {
          key: `description-bullets-${nodes.length}`,
          style: styles.bulletGroup as CSSProperties,
        },
        bulletLines.map((line, index) =>
          React.createElement(
            "div",
            {
              key: `description-bullet-${index}`,
              style: styles.bulletRow as CSSProperties,
            },
            React.createElement(
              "span",
              {
                style: {
                  ...appStyle.textNeutralMedium,
                  ...bodyTextStyle,
                  ...styles.bulletMarker,
                } as CSSProperties,
              },
              "•",
            ),
            React.createElement(
              "span",
              {
                style: {
                  ...appStyle.textNeutralMedium,
                  ...bodyTextStyle,
                  ...styles.bulletText,
                } as CSSProperties,
              },
              line,
            ),
          ),
        ),
      ),
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
      React.createElement(
        "span",
        {
          key: `description-paragraph-${nodes.length}`,
          style: {
            ...appStyle.textNeutralMedium,
            ...bodyTextStyle,
          } as CSSProperties,
        },
        line,
      ),
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
  return React.createElement(
    "div",
    {
      style: {
        ...styles.descriptionSection,
        backgroundColor: convertHexToRgba(appColors.warmgray6, 0.2),
        borderColor: convertHexToRgba(appColors.coolgray2, 0.9),
      } as CSSProperties,
    },
    React.createElement(
      "div",
      { style: styles.descriptionGroup as CSSProperties },
      renderProjectDescription(description, appStyle),
    ),
  );
}
