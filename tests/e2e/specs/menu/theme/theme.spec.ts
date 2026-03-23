import { test } from "@playwright/test";
import { exampleAppDataEn } from "../../../fixtures/example-app-data";
import { MenuPage } from "../../../helpers/page-objects/menu.page";

test("user cycles the theme states from the menu", async ({ page }) => {
  const menuPage = new MenuPage(page);

  await test.step("navigate to the menu page", async () => {
    await menuPage.navigateToPage();
    await menuPage.assertIsOnPage();
    await menuPage.assertThemeLabel(exampleAppDataEn.menu.themeSystemLabel);
  });

  await test.step("toggle from system to light", async () => {
    await menuPage.toggleTheme(exampleAppDataEn.menu.themeSystemLabel);
    await menuPage.assertThemeLabel(exampleAppDataEn.menu.themeLightLabel);
  });

  await test.step("toggle from light to dark", async () => {
    await menuPage.toggleTheme(exampleAppDataEn.menu.themeLightLabel);
    await menuPage.assertThemeLabel(exampleAppDataEn.menu.themeDarkLabel);
  });

  await test.step("toggle from dark back to system", async () => {
    await menuPage.toggleTheme(exampleAppDataEn.menu.themeDarkLabel);
    await menuPage.assertThemeLabel(exampleAppDataEn.menu.themeSystemLabel);
  });
});
