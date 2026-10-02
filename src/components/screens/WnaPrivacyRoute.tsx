import { useWnaAppData } from "@/state/WnaAppContext";
import { i18nKeys } from "@/i18n/i18nKeys";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLegalData } from "@utils/legalData";
import { buildPrivacyHtml } from "./legalContent";
import WnaLegalDocumentScreen from "./WnaLegalDocumentScreen";

export default function WnaPrivacyRoute(): ReactNode {
  const { appData } = useWnaAppData();
  const { t } = useTranslation(["common"]);
  const legalData = useLegalData();

  return (
    <WnaLegalDocumentScreen
      headerTitle={t(i18nKeys.screenTitlePrivacy)}
      htmlContent={buildPrivacyHtml(appData, legalData)}
    />
  );
}
