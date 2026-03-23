import { i18nKeys } from "@/i18n/i18nKeys";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { getLicensesHtmlContent } from "./legalContent";
import WnaLegalDocumentScreen from "./WnaLegalDocumentScreen";

export default function WnaLicensesRoute(): ReactNode {
  const { t } = useTranslation(["common"]);

  return (
    <WnaLegalDocumentScreen
      headerTitle={t(i18nKeys.screenTitleLicenses)}
      htmlContent={getLicensesHtmlContent()}
    />
  );
}
