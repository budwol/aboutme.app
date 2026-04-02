import { test } from "@playwright/test";
import { LegalPage } from "../../../helpers/page-objects/legal.page";

test.use({ locale: "de-DE" });

test("user opens the german licenses route directly", async ({ page }) => {
  const legalPage = new LegalPage(page);

  await test.step("navigate to the german licenses page", async () => {
    await legalPage.navigateToGermanLicensesPage();
    await legalPage.assertIsOnGermanLicensesPage();
  });

  await test.step("verify the german licenses content", async () => {
    await legalPage.assertGermanLicensesContent();
  });
});
