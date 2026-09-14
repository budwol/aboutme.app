import Logger from "wna-logger";
import React, { CSSProperties, useCallback } from "react";
import { WnaSectionProps } from "@components/sections/wnaSectionProps";
import { i18nKeys } from "@/i18n/i18nKeys";
import { useTranslation } from "react-i18next";
import WnaButtonIcon from "@components/buttons/WnaButtonIcon";
import { getResumePdfUrl } from "@utils/resumePdfUrl";
import { useWnaLayout } from "@/state/WnaAppContext";
import { Linking } from "@utils/webLinking";

const buttonSize = 52;
const buttonGap = 16;
const narrowActionsWidth = buttonSize * 3 + buttonGap * 2;

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    padding: 12,
    backgroundColor: "transparent",
  },
  actions: {
    display: "flex",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: buttonGap,
    rowGap: buttonGap,
    width: "100%",
    maxWidth: 320,
    minWidth: 0,
  },
  actionsNarrow: {
    maxWidth: narrowActionsWidth,
  },
  actionItem: {
    width: buttonSize,
    flexBasis: buttonSize,
    flexGrow: 0,
    flexShrink: 0,
  },
} satisfies Record<string, CSSProperties>;

export default function WnaContactSection({
  appColors,
  appData,
  appStyle,
}: WnaSectionProps) {
  const { currentWindowWidth } = useWnaLayout();
  const { t, i18n } = useTranslation(["common"]);
  const resumeLang =
    (i18n.resolvedLanguage ?? i18n.language) === "de" ? "de" : "en";

  const handleOpenUrl = useCallback(async (url: string, type: string) => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Logger.error(WnaContactSection.name, `${type} not supported`);
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      Logger.error(type, error);
    }
  }, []);

  const phone = appData?.contact?.phone;
  const email = appData?.contact?.email;

  return React.createElement(
    "div",
    { style: styles.container },
    React.createElement(
      "div",
      {
        style: {
          ...styles.actions,
          ...(currentWindowWidth < 600 ? styles.actionsNarrow : null),
        } as CSSProperties,
      },
      React.createElement(
        "div",
        { key: "github", style: styles.actionItem },
        <WnaButtonIcon
          appColors={appColors}
          appStyle={appStyle}
          iconName={"github"}
          onPress={() => handleOpenUrl(appData.contact.github, "github")}
          checkInternetConnection={false}
          toolTipPosition="top"
          toolTip={t(i18nKeys.actionGithub)}
          t={t}
        />,
      ),
      React.createElement(
        "div",
        { key: "linkedIn", style: styles.actionItem },
        <WnaButtonIcon
          appColors={appColors}
          appStyle={appStyle}
          iconName={"linkedin"}
          onPress={() => handleOpenUrl(appData.contact.linkedin, "linkedin")}
          checkInternetConnection={false}
          toolTipPosition="top"
          toolTip={t(i18nKeys.actionLinkedin)}
          t={t}
        />,
      ),
      React.createElement(
        "div",
        { key: "xing", style: styles.actionItem },
        <WnaButtonIcon
          appColors={appColors}
          appStyle={appStyle}
          iconName={"xing"}
          onPress={() => handleOpenUrl(appData.contact.xing, "xing")}
          checkInternetConnection={false}
          toolTipPosition="top"
          toolTip={t(i18nKeys.actionXing)}
          t={t}
        />,
      ),
      phone &&
        React.createElement(
          "div",
          { key: "phone", style: styles.actionItem },
          <WnaButtonIcon
            appColors={appColors}
            appStyle={appStyle}
            iconName={"phone"}
            onPress={() => handleOpenUrl(`tel:${phone}`, "tel")}
            checkInternetConnection={false}
            toolTipPosition="top"
            toolTip={t(i18nKeys.actionPhoneCall)}
            t={t}
          />,
        ),
      email &&
        React.createElement(
          "div",
          { key: "email", style: styles.actionItem },
          <WnaButtonIcon
            appColors={appColors}
            appStyle={appStyle}
            iconName={"email"}
            onPress={() => handleOpenUrl(`mailto:${email}`, "mailto")}
            checkInternetConnection={false}
            toolTipPosition="top"
            toolTip={t(i18nKeys.actionEmail)}
            t={t}
          />,
        ),
      React.createElement(
        "div",
        { key: "resume", style: styles.actionItem },
        <WnaButtonIcon
          appColors={appColors}
          appStyle={appStyle}
          iconName={"file-pdf-box"}
          onPress={() =>
            handleOpenUrl(
              getResumePdfUrl(resumeLang, appData.profile.name),
              "resume",
            )
          }
          checkInternetConnection={false}
          toolTipPosition="top"
          toolTip={t(i18nKeys.actionDownloadResume)}
          t={t}
        />,
      ),
    ),
  );
}
