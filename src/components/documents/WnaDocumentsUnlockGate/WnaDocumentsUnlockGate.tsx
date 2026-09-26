import WnaButtonIconText from "@components/buttons/WnaButtonIconText";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import WnaSeparatorHorizontal from "@components/display/WnaSeparatorHorizontal";
import { convertHexToRgba } from "@utils/colorConverter";
import { appLayoutConstants } from "@constants/layoutConstants";
import Colors from "@constants/theme/colors";
import AppStyle from "@/theme/appStyle";
import { i18nKeys } from "@/i18n/i18nKeys";
import { TFunction } from "i18next";
import React, { CSSProperties, ReactNode, useState } from "react";

// WnaButtonIconText's own fixed height (actionButtonRightConstants.size) --
// the password input matches it explicitly so the two controls line up
// flush in one row instead of the input's browser-default height.
const UNLOCK_CONTROL_HEIGHT = 52;
const ICON_BADGE_SIZE = 56;

const styles = {
  gate: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  iconBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: ICON_BADGE_SIZE,
    height: ICON_BADGE_SIZE,
    borderRadius: ICON_BADGE_SIZE / 2,
  },
  title: {
    textAlign: "center",
  },
  body: {
    textAlign: "center",
  },
  unlockRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  passwordFieldWrapper: {
    position: "relative",
    flex: 1,
    minWidth: 0,
  },
  passwordVisibilityToggle: {
    position: "absolute",
    top: 0,
    right: 0,
    height: "100%",
    width: 44,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
  },
} satisfies Record<string, CSSProperties>;

export type WnaDocumentsUnlockGateProps = {
  appColors: Colors;
  appStyle: AppStyle;
  t: TFunction<string[], undefined>;
  // Omitted on the full downloads list, which already shows its own
  // persistent description above the gate (visible both locked and
  // unlocked) -- showing it a second time here would just repeat the same
  // sentence. The detail page has no such persistent description, so it
  // passes one.
  bodyText?: string;
  password: string;
  setPassword: (value: string) => void;
  error: string | null;
  isVerifying: boolean;
  onUnlock: () => void;
};

// The password prompt shown by every document-gated screen (the full
// downloads list, and each document's own detail page) -- a centered icon
// badge + heading + body copy above the actual input/button row, replacing
// what used to be just a bare <input> and button on the page's plain
// background.
export default function WnaDocumentsUnlockGate({
  appColors,
  appStyle,
  t,
  bodyText,
  password,
  setPassword,
  error,
  isVerifying,
  onUnlock,
}: WnaDocumentsUnlockGateProps): ReactNode {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const inputStyle: CSSProperties = {
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: appColors.coolgray2,
    backgroundColor: appColors.background,
    color: appColors.text,
    // A plain DOM <input> isn't covered by the app's own theming -- without
    // this, the browser applies its native (often OS-dark-mode-driven)
    // color-scheme UA styling to the field's text/caret regardless of the
    // inline color/backgroundColor set above, which is exactly why the text
    // color could still look wrong against our custom background.
    colorScheme: appColors.isDark ? "dark" : "light",
    paddingInlineStart: 12,
    paddingInlineEnd: 44,
    fontSize: 15,
    height: UNLOCK_CONTROL_HEIGHT,
    width: "100%",
    boxSizing: "border-box",
  };

  return React.createElement(
    "div",
    { style: styles.gate },
    React.createElement(
      "div",
      {
        style: {
          ...styles.iconBadge,
          backgroundColor: convertHexToRgba(appColors.accent4, 0.15),
        },
      },
      <WnaIcon
        iconName="shield-lock-outline"
        size={28}
        color={appColors.accent4}
      />,
    ),
    React.createElement(
      "span",
      { style: { ...appStyle.textNeutralTitleLarge, ...styles.title } },
      t(i18nKeys.downloadsUnlockTitle),
    ),
    bodyText
      ? React.createElement(
          "span",
          { style: { ...appStyle.textNeutralMedium, ...styles.body } },
          bodyText,
        )
      : null,
    <WnaSeparatorHorizontal transparent={true} space={4} />,
    React.createElement(
      "div",
      { style: styles.unlockRow },
      React.createElement(
        "div",
        { style: styles.passwordFieldWrapper },
        React.createElement("input", {
          type: isPasswordVisible ? "text" : "password",
          value: password,
          placeholder: t(i18nKeys.labelPassword),
          style: inputStyle,
          disabled: isVerifying,
          onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(event.target.value),
          onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
              onUnlock();
            }
          },
        }),
        React.createElement(
          "button",
          {
            type: "button",
            style: styles.passwordVisibilityToggle,
            "aria-label": t(
              isPasswordVisible
                ? i18nKeys.actionHidePassword
                : i18nKeys.actionShowPassword,
            ),
            onClick: () => setIsPasswordVisible((prev) => !prev),
          },
          <WnaIcon
            iconName={isPasswordVisible ? "eye-off" : "eye"}
            size={20}
            color={appColors.coolgray5}
          />,
        ),
      ),
      <WnaButtonIconText
        appColors={appColors}
        appStyle={appStyle}
        text={t(i18nKeys.actionUnlock)}
        iconName="lock-open"
        onPress={onUnlock}
        disabled={isVerifying || password === ""}
        style={{ marginInline: 0, flexShrink: 0 }}
        t={t}
      />,
    ),
    error
      ? React.createElement(
          "span",
          {
            style: {
              ...appStyle.textNeutralMedium,
              color: appColors.red4,
              textAlign: "center",
            },
          },
          error,
        )
      : null,
  );
}
