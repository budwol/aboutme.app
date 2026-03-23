import { test } from "@playwright/test";
import { LegalPage } from "../../../helpers/page-objects/legal.page";
import { MenuPage } from "../../../helpers/page-objects/menu.page";

test("user opens the privacy page and navigates back to the menu", async ({
  page,
}) => {
  const menuPage = new MenuPage(page);
  const legalPage = new LegalPage(page);

  await test.step("navigate to the menu page", async () => {
    await menuPage.navigateToPage();
    await menuPage.assertIsOnPage();
    await menuPage.assertContent();
  });

  await test.step("open the privacy page and verify it", async () => {
    await menuPage.openPrivacyPage();
    await legalPage.assertIsOnPage(/\/menu\/privacy$/, "Privacy Policy");
    await legalPage.assertPrivacyContent();
  });

  await test.step("navigate back to the menu", async () => {
    await legalPage.goBack();
    await menuPage.assertIsOnPage();
  });
});
