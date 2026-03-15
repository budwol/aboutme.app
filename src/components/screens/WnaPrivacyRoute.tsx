import { useWnaAppData } from "@components/WnaAppContext";
import { seoCatalog } from "@constants/seoCatalog";
import { ReactNode } from "react";
import { buildPrivacyHtml } from "./legalContent";
import WnaLegalDocumentScreen from "./WnaLegalDocumentScreen";

export default function WnaPrivacyRoute(): ReactNode {
  const { appData } = useWnaAppData();

  return (
    <WnaLegalDocumentScreen
      seoEntry={seoCatalog.privacy}
      htmlContent={buildPrivacyHtml(appData)}
    />
  );
}
