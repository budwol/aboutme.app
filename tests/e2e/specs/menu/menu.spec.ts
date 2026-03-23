import { test } from "@playwright/test";
import { MenuPage } from "../../helpers/page-objects/menu.page";

test("user opens the menu page and sees the expected menu content", async ({
  page,
}) => {
  const menuPage = new MenuPage(page);

  await test.step("navigate to the menu page", async () => {
    await menuPage.navigateToPage();
    await menuPage.assertIsOnPage();
  });

  await test.step("verify menu content", async () => {
    await menuPage.assertContent();
  });
});
