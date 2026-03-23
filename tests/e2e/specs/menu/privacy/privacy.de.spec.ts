import { test } from "@playwright/test";
import { LegalPage } from "../../../helpers/page-objects/legal.page";

test.use({ locale: "de-DE" });

test("user opens the german privacy route directly", async ({ page }) => {
  const legalPage = new LegalPage(page);

  await test.step("navigate to the german privacy page", async () => {
    await legalPage.navigateToGermanPrivacyPage();
    await legalPage.assertIsOnGermanPrivacyPage();
  });

  await test.step("verify the german privacy content", async () => {
    await legalPage.assertGermanPrivacyContent();
  });
});
