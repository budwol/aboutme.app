import { i18nKeys } from "@services/i18n/i18nKeys";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { getTermsHtmlContent } from "./legalContent";
import WnaLegalDocumentScreen from "./WnaLegalDocumentScreen";

export default function WnaTermsRoute(): ReactNode {
  const { t } = useTranslation(["common"]);

  return (
    <WnaLegalDocumentScreen
      headerTitle={t(i18nKeys.screenTitleTerms)}
      htmlContent={getTermsHtmlContent()}
    />
  );
}
