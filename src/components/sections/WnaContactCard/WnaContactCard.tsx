import Logger from "wna-logger";
import React, { useCallback } from "react";
import { View, Linking } from "react-native";
import { WnaSectionProps } from "@components/sections/WnaSectionProps";
import { i18nKeys } from "@/i18n/i18nKeys";
import { useTranslation } from "react-i18next";
import WnaButtonIcon from "@components/buttons/WnaButtonIcon";

export default function WnaContactCard({
  appColors,
  appData,
  appStyle,
}: WnaSectionProps) {
  const { t } = useTranslation(["common"]);

  const handleOpenUrl = useCallback(async (url: string, type: string) => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Logger.error(WnaContactCard.name, `${type} not supported`);
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      Logger.error(type, error);
    }
  }, []);

  const phone = appData?.contact?.phone;
  const email = appData?.contact?.email;

  return (
    <View
      style={{
        width: "100%",
        gap: 24,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <WnaButtonIcon
        key={"github"}
        appColors={appColors}
        appStyle={appStyle}
        iconName={"github"}
        onPress={() => handleOpenUrl(appData.contact.github, "github")}
        checkInternetConnection={false}
        toolTipPosition="top"
        toolTip={t(i18nKeys.actionGithub)}
        t={t}
      />
      <WnaButtonIcon
        key={"linkedIn"}
        appColors={appColors}
        appStyle={appStyle}
        iconName={"linkedin"}
        onPress={() => handleOpenUrl(appData.contact.linkedin, "linkedin")}
        checkInternetConnection={false}
        toolTipPosition="top"
        toolTip={t(i18nKeys.actionLinkedin)}
        t={t}
      />
      <WnaButtonIcon
        key={"xing"}
        appColors={appColors}
        appStyle={appStyle}
        iconName={"xing"}
        onPress={() => handleOpenUrl(appData.contact.xing, "xing")}
        checkInternetConnection={false}
        toolTipPosition="top"
        toolTip={t(i18nKeys.actionXing)}
        t={t}
      />
      {phone && (
        <WnaButtonIcon
          key={"phone"}
          appColors={appColors}
          appStyle={appStyle}
          iconName={"phone"}
          onPress={() => handleOpenUrl(`tel:${phone}`, "tel")}
          checkInternetConnection={false}
          toolTipPosition="top"
          toolTip={t(i18nKeys.actionPhoneCall)}
          t={t}
        />
      )}
      {email && (
        <WnaButtonIcon
          key={"email"}
          appColors={appColors}
          appStyle={appStyle}
          iconName={"email"}
          onPress={() => handleOpenUrl(`mailto:${email}`, "mailto")}
          checkInternetConnection={false}
          toolTipPosition="top"
          toolTip={t(i18nKeys.actionEmail)}
          t={t}
        />
      )}
    </View>
  );
}
