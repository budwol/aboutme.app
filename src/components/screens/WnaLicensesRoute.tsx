import { seoCatalog } from "@constants/seoCatalog";
import { ReactNode } from "react";
import { licensesHtmlContent } from "./legalContent";
import WnaLegalDocumentScreen from "./WnaLegalDocumentScreen";

export default function WnaLicensesRoute(): ReactNode {
  return (
    <WnaLegalDocumentScreen
      seoEntry={seoCatalog.licenses}
      htmlContent={licensesHtmlContent}
    />
  );
}
