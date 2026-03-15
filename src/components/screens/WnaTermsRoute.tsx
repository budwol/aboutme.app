import { seoCatalog } from "@constants/seoCatalog";
import { ReactNode } from "react";
import { termsHtmlContent } from "./legalContent";
import WnaLegalDocumentScreen from "./WnaLegalDocumentScreen";

export default function WnaTermsRoute(): ReactNode {
  return (
    <WnaLegalDocumentScreen
      seoEntry={seoCatalog.terms}
      htmlContent={termsHtmlContent}
    />
  );
}
