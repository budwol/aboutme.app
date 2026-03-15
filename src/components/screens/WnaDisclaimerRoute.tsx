import { useWnaAppData } from "@components/WnaAppContext";
import { i18nKeys } from "@services/i18n/i18nKeys";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { buildDisclaimerHtml } from "./legalContent";
import WnaLegalDocumentScreen from "./WnaLegalDocumentScreen";

export default function WnaDisclaimerRoute(): ReactNode {
  const { appData } = useWnaAppData();
  const { t } = useTranslation(["common"]);

  return (
    <WnaLegalDocumentScreen
      headerTitle={t(i18nKeys.screenTitleDisclaimer)}
      htmlContent={buildDisclaimerHtml(appData)}
    />
  );
}
