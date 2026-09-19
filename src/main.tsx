import { createRoot } from "react-dom/client";
import WnaRootLayout from "@components/WnaRootLayout";
import WnaErrorBoundary from "@components/WnaErrorBoundary";
import "./serviceWorkerRegistration";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container #root not found");
}

createRoot(container).render(
  <WnaErrorBoundary>
    <WnaRootLayout />
  </WnaErrorBoundary>,
);
