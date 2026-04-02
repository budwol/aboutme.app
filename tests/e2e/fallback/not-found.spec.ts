import { test } from "@playwright/test";
import { FallbackPage } from "../../helpers/page-objects/fallback.page";
import { HomePage } from "../../helpers/page-objects/home.page";

test("user opens an unknown route and is redirected to the home page", async ({
  page,
}) => {
  const fallbackPage = new FallbackPage(page);
  const homePage = new HomePage(page);

  await test.step("navigate to an unknown route", async () => {
    await fallbackPage.navigateToUnknownRoute();
  });

  await test.step("verify the route falls back to the home page", async () => {
    await fallbackPage.assertRedirectedToHome();
    await homePage.expectIntroToAppear();
    await homePage.expectHomeToBeReady();
  });
});
