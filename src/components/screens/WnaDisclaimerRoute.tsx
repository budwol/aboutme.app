import { useWnaAppData } from "@components/WnaAppContext";
import { seoCatalog } from "@constants/seoCatalog";
import { ReactNode } from "react";
import { buildDisclaimerHtml } from "./legalContent";
import WnaLegalDocumentScreen from "./WnaLegalDocumentScreen";

export default function WnaDisclaimerRoute(): ReactNode {
  const { appData } = useWnaAppData();

  return (
    <WnaLegalDocumentScreen
      seoEntry={seoCatalog.disclaimer}
      htmlContent={buildDisclaimerHtml(appData)}
    />
  );
}
