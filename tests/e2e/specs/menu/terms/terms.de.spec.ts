import { test } from "@playwright/test";
import { LegalPage } from "../../../helpers/page-objects/legal.page";

test.use({ locale: "de-DE" });

test("user opens the german terms route directly", async ({ page }) => {
  const legalPage = new LegalPage(page);

  await test.step("navigate to the german terms page", async () => {
    await legalPage.navigateToGermanTermsPage();
    await legalPage.assertIsOnGermanTermsPage();
  });

  await test.step("verify the german terms content", async () => {
    await legalPage.assertGermanTermsContent();
  });
});
