import { test } from "@playwright/test";
import { LegalPage } from "../../../helpers/page-objects/legal.page";
import { MenuPage } from "../../../helpers/page-objects/menu.page";

test("user opens the terms page and navigates back to the menu", async ({
  page,
}) => {
  const menuPage = new MenuPage(page);
  const legalPage = new LegalPage(page);

  await test.step("navigate to the menu page", async () => {
    await menuPage.navigateToPage();
    await menuPage.assertIsOnPage();
    await menuPage.assertContent();
  });

  await test.step("open the terms page and verify it", async () => {
    await menuPage.openTermsPage();
    await legalPage.assertIsOnPage(/\/menu\/terms-of-use$/, "Terms of Use");
    await legalPage.assertTermsContent();
  });

  await test.step("navigate back to the menu", async () => {
    await legalPage.goBack();
    await menuPage.assertIsOnPage();
  });
});
