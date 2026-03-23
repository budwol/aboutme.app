import { test } from "@playwright/test";
import { LegalPage } from "../../../helpers/page-objects/legal.page";
import { MenuPage } from "../../../helpers/page-objects/menu.page";

test("user opens the disclaimer page from the menu", async ({ page }) => {
  const menuPage = new MenuPage(page);
  const legalPage = new LegalPage(page);

  await test.step("navigate to the menu page", async () => {
    await menuPage.navigateToPage();
    await menuPage.assertIsOnPage();
  });

  await test.step("open the disclaimer page from the menu", async () => {
    await menuPage.openDisclaimerPage();
    await legalPage.assertIsOnPage(/\/menu\/disclaimer$/, "Imprint");
  });

  await test.step("verify the disclaimer content", async () => {
    await legalPage.assertDisclaimerContent();
  });
});
