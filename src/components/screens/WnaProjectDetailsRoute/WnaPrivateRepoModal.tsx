import WnaButtonIconText from "@components/buttons/WnaButtonIconText";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { i18nKeys } from "@/i18n/i18nKeys";
import { convertHexToRgba } from "@utils/colorConverter";
import type { TFunction } from "i18next";
import { ReactNode } from "react";
import { Linking, Modal, Pressable, Text, View } from "react-native";
import { styles } from "./styles";
import type {
  WnaProjectDetailsProject,
  WnaProjectDetailsThemeProps,
} from "./types";

type WnaPrivateRepoModalProps = WnaProjectDetailsThemeProps & {
  privateRepoMailToUrl: string;
  project: WnaProjectDetailsProject;
  t: TFunction<"common">;
  visible: boolean;
  onClose: () => void;
};

export default function WnaPrivateRepoModal({
  appColors,
  appStyle,
  onClose,
  privateRepoMailToUrl,
  project,
  t,
  visible,
}: WnaPrivateRepoModalProps): ReactNode {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View
          testID="private-repo-modal-dialog"
          style={[
            styles.modalDialog,
            {
              backgroundColor: convertHexToRgba(appColors.background, 0.96),
              borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
            },
          ]}
        >
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
              <Pressable
                testID="private-repo-modal-close"
                accessibilityRole="button"
                accessibilityLabel={t(i18nKeys.actionClose)}
                onPress={onClose}
                style={[
                  styles.modalCloseButton,
                  {
                    backgroundColor: convertHexToRgba(
                      appColors.background,
                      0.98,
                    ),
                    borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
                  },
                ]}
              >
                <WnaIcon iconName="close" size={18} color={appColors.black} />
              </Pressable>
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
              textColor={appColors.black}
              backgroundColor={convertHexToRgba(appColors.background, 0.98)}
              borderWidth={1}
              style={{
                ...styles.actionButton,
                ...styles.modalActionButton,
                borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
                marginHorizontal: 0,
              }}
              onPress={() => {
                onClose();
                /* istanbul ignore next -- this modal only opens via the github projectLinks entry, which is filtered out whenever repoUrl is falsy, so repoUrl is always truthy here */
                Linking.openURL(project.repoUrl ?? "");
              }}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
