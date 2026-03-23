import { useCallback, useMemo } from "react";
import { Linking, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useWnaTheme } from "@components/WnaAppContext";
import WnaButtonIcon from "@components/buttons/WnaButtonIcon";
import WnaSectionTitle from "@components/text/WnaSectionTitle";
import { i18nKeys } from "@/i18n/i18nKeys";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";

export interface WnaShareActionsProps {
  url: string;
  title: string;
}

export default function WnaShareActions({ url, title }: WnaShareActionsProps) {
  const { appColors, appStyle } = useWnaTheme();
  const { t } = useTranslation(["common"]);

  const encodedUrl = useMemo(() => encodeURIComponent(url), [url]);
  const encodedTitle = useMemo(() => encodeURIComponent(title), [title]);

  const open = useCallback((link: string) => {
    Linking.openURL(link);
  }, []);

  const shareActions = useMemo(
    () => [
      {
        icon: "facebook" as keyof typeof iconMap,
        link: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        tooltip: t(i18nKeys.actionShareViaFacebook),
      },
      {
        icon: "whatsapp" as keyof typeof iconMap,
        link: `https://api.whatsapp.com/send?text=${encodedUrl}`,
        tooltip: t(i18nKeys.actionShareViaWhatsApp),
      },
      {
        icon: "alpha-t-circle" as keyof typeof iconMap,
        link: `https://telegram.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        tooltip: t(i18nKeys.actionShareViaTelegram),
      },
      {
        icon: "email" as keyof typeof iconMap,
        link: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
        tooltip: t(i18nKeys.actionShareViaEmail),
      },
    ],
    [encodedUrl, encodedTitle, t],
  );

  return (
    <View>
      <WnaSectionTitle
        appColors={appColors}
        appStyle={appStyle}
        titleTextColor={appColors.staticWhite}
        title={t(i18nKeys.actionShare)}
      />

      <View
        style={{
          margin: 16,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {shareActions.map(({ icon, link, tooltip }) => (
          <WnaButtonIcon
            key={icon}
            appColors={appColors}
            appStyle={appStyle}
            iconName={icon}
            onPress={() => open(link)}
            checkInternetConnection={false}
            toolTipPosition="top"
            toolTip={tooltip}
            t={t}
          />
        ))}
      </View>
    </View>
  );
}
