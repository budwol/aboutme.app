import { test } from "@playwright/test";
import { LegalPage } from "../../../helpers/page-objects/legal.page";
import { MenuPage } from "../../../helpers/page-objects/menu.page";

test("user opens the privacy page from the menu", async ({ page }) => {
  const menuPage = new MenuPage(page);
  const legalPage = new LegalPage(page);

  await test.step("navigate to the menu page", async () => {
    await menuPage.navigateToPage();
    await menuPage.assertIsOnPage();
  });

  await test.step("open the privacy page from the menu", async () => {
    await menuPage.openPrivacyPage();
    await legalPage.assertIsOnPage(/\/menu\/privacy$/, "Privacy Policy");
  });

  await test.step("verify the privacy content", async () => {
    await legalPage.assertPrivacyContent();
  });
});
