import { test } from "@playwright/test";
import { LegalPage } from "../../../helpers/page-objects/legal.page";
import { MenuPage } from "../../../helpers/page-objects/menu.page";

test("user opens the terms page from the menu on a mobile portrait viewport", async ({
  page,
}) => {
  const menuPage = new MenuPage(page);
  const legalPage = new LegalPage(page);

  await test.step("navigate to the menu page", async () => {
    await menuPage.navigateToPage();
    await menuPage.assertIsOnPage();
  });

  await test.step("open the terms page from the menu", async () => {
    await menuPage.openTermsPage();
    await legalPage.assertIsOnPage(/\/menu\/terms-of-use$/, "Terms of Use");
  });

  await test.step("verify the terms content", async () => {
    await legalPage.assertTermsContent();
  });
});
