import { test } from "@playwright/test";
import { LegalPage } from "../../../helpers/page-objects/legal.page";
import { MenuPage } from "../../../helpers/page-objects/menu.page";

test("user opens the licenses page from the menu on a mobile portrait viewport", async ({
  page,
}) => {
  const menuPage = new MenuPage(page);
  const legalPage = new LegalPage(page);

  await test.step("navigate to the menu page", async () => {
    await menuPage.navigateToPage();
    await menuPage.assertIsOnPage();
  });

  await test.step("open the licenses page from the menu", async () => {
    await menuPage.openLicensesPage();
    await legalPage.assertIsOnPage(
      /\/menu\/third-party-licenses$/,
      "Open Source Software",
    );
  });

  await test.step("verify the licenses content", async () => {
    await legalPage.assertLicensesContent();
  });
});
