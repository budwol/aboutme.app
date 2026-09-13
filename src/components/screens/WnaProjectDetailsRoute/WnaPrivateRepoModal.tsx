import WnaButtonIconText from "@components/buttons/WnaButtonIconText";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { i18nKeys } from "@/i18n/i18nKeys";
import { convertHexToRgba } from "@utils/colorConverter";
import type { TFunction } from "i18next";
import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { StyleSheet, Text, View } from "react-native";
import { Linking } from "@utils/webLinking";
import { styles } from "./wnaProjectDetailsRouteStyles";
import type {
  WnaProjectDetailsProject,
  WnaProjectDetailsThemeProps,
} from "./wnaProjectDetailsRouteTypes";

type WnaPrivateRepoModalProps = WnaProjectDetailsThemeProps & {
  privateRepoMailToUrl: string;
  project: WnaProjectDetailsProject;
  t: TFunction<"common">;
  visible: boolean;
  onClose: () => void;
};

type WnaWebModalProps = {
  children: ReactNode;
  onRequestClose: () => void;
  visible: boolean;
};

export function WnaWebModal({
  children,
  onRequestClose,
  visible,
}: WnaWebModalProps): ReactNode {
  const canAnimate = typeof document !== "undefined" && Boolean(document.body);
  const [mounted, setMounted] = useState(visible);
  const [isClosing, setIsClosing] = useState(false);
  const [isActive, setIsActive] = useState(!canAnimate);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setIsClosing(false);
      return;
    }

    if (!mounted || !canAnimate) {
      setMounted(false);
      return;
    }

    setIsClosing(true);
    setIsActive(false);
    const timeout = window.setTimeout(() => {
      setMounted(false);
      setIsClosing(false);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [canAnimate, mounted, visible]);

  useEffect(() => {
    if (!visible || !canAnimate) return;

    setIsActive(false);
    const timeout = window.setTimeout(() => setIsActive(true), 16);
    return () => window.clearTimeout(timeout);
  }, [canAnimate, visible]);

  useEffect(() => {
    if (!visible || typeof document === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onRequestClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onRequestClose, visible]);

  if (!mounted) return null;

  const modal = React.createElement(
    "div",
    {
      id: "private-repo-modal",
      nativeID: "private-repo-modal",
      "aria-label": "private-repo-modal",
      role: "dialog",
      "aria-modal": true,
      style: {
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        opacity: isClosing || !isActive ? 0 : 1,
        pointerEvents: isClosing ? "none" : "auto",
        transition: "opacity 180ms ease-out",
      } as React.CSSProperties,
    },
    children,
  );

  return typeof document !== "undefined" && document.body
    ? createPortal(modal, document.body)
    : modal;
}

export default function WnaPrivateRepoModal({
  appColors,
  appStyle,
  onClose,
  privateRepoMailToUrl,
  project,
  t,
  visible,
}: WnaPrivateRepoModalProps): ReactNode {
  const continueButtonTextColor = appColors.isDark
    ? appColors.staticWhite
    : appColors.black;
  const continueButtonBackgroundColor = appColors.isDark
    ? convertHexToRgba(appColors.staticWhite, 0.12)
    : convertHexToRgba(appColors.background, 0.98);
  const continueButtonBorderColor = appColors.isDark
    ? convertHexToRgba(appColors.staticWhite, 0.4)
    : convertHexToRgba(appColors.coolgray2, 0.72);

  return (
    <WnaWebModal visible={visible} onRequestClose={onClose}>
      {React.createElement(
        "div",
        {
          "data-testid": "private-repo-modal-backdrop",
          style: {
            ...StyleSheet.flatten(styles.modalBackdrop),
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          } as React.CSSProperties,
          onClick: onClose,
        },
        React.createElement(
          "div",
          {
            "data-testid": "private-repo-modal-dialog",
            style: StyleSheet.flatten([
              styles.modalDialog,
              {
                backgroundColor: convertHexToRgba(appColors.background, 0.96),
                borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
              },
            ]) as React.CSSProperties,
            onClick: (event: React.MouseEvent) => event.stopPropagation(),
          },
          <>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTop}>
                <View style={styles.modalHeaderCopy}>
                  <Text
                    style={[
                      appStyle.textNeutralMedium,
                      { color: appColors.black, fontWeight: "700" },
                    ]}
                  >
                    {t(i18nKeys.titlePrivateRepo)}
                  </Text>
                </View>
                {React.createElement(
                  "button",
                  {
                    type: "button",
                    "data-testid": "private-repo-modal-close",
                    "aria-label": t(i18nKeys.actionClose),
                    onClick: onClose,
                    style: StyleSheet.flatten([
                      styles.modalCloseButton,
                      {
                        backgroundColor: convertHexToRgba(
                          appColors.background,
                          0.98,
                        ),
                        borderColor: convertHexToRgba(
                          appColors.coolgray2,
                          0.72,
                        ),
                        borderStyle: "solid",
                        appearance: "none",
                        cursor: "pointer",
                        padding: 0,
                      },
                    ]) as React.CSSProperties,
                  },
                  <WnaIcon
                    iconName="close"
                    size={18}
                    color={appColors.black}
                  />,
                )}
              </View>
            </View>

            <View style={styles.modalBody}>
              <Text
                style={[
                  appStyle.textNeutralMedium,
                  { color: appColors.black, opacity: 0.86 },
                ]}
              >
                {t(i18nKeys.infoPrivateRepoHint)}{" "}
                {t(i18nKeys.infoPrivateRepoBody)}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <WnaButtonIconText
                appColors={appColors}
                appStyle={appStyle}
                iconName="email"
                text={t(i18nKeys.actionEmail)}
                textColor={appColors.staticWhite}
                backgroundColor={convertHexToRgba(appColors.accent5, 0.92)}
                borderWidth={1}
                style={{
                  ...styles.actionButton,
                  ...styles.modalActionButton,
                  borderColor: convertHexToRgba(appColors.coolgray2, 0.4),
                  marginHorizontal: 0,
                }}
                onPress={() => {
                  onClose();
                  Linking.openURL(privateRepoMailToUrl);
                }}
              />
              <WnaButtonIconText
                appColors={appColors}
                appStyle={appStyle}
                iconName="github"
                text={t(i18nKeys.actionContinueToPage)}
                textColor={continueButtonTextColor}
                backgroundColor={continueButtonBackgroundColor}
                borderWidth={1}
                style={{
                  ...styles.actionButton,
                  ...styles.modalActionButton,
                  borderColor: continueButtonBorderColor,
                  marginHorizontal: 0,
                }}
                onPress={() => {
                  onClose();
                  /* istanbul ignore next -- this modal only opens via the github projectLinks entry, which is filtered out whenever repoUrl is falsy, so repoUrl is always truthy here */
                  Linking.openURL(project.repoUrl ?? "");
                }}
              />
            </View>
          </>,
        ),
      )}
    </WnaWebModal>
  );
}
