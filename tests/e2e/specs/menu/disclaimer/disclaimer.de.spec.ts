import { test } from "@playwright/test";
import { LegalPage } from "../../../helpers/page-objects/legal.page";

test.use({ locale: "de-DE" });

test("user opens the german disclaimer route directly", async ({ page }) => {
  const legalPage = new LegalPage(page);

  await test.step("navigate to the german disclaimer page", async () => {
    await legalPage.navigateToGermanDisclaimerPage();
    await legalPage.assertIsOnGermanDisclaimerPage();
  });

  await test.step("verify the german disclaimer content", async () => {
    await legalPage.assertGermanDisclaimerContent();
  });
});
