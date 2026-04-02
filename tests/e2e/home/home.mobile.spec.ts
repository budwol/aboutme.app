import { test } from "@playwright/test";
import { HomePage } from "../../helpers/page-objects/home.page";

test("user opens the home page on a mobile portrait viewport", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  await test.step("navigate to the home page", async () => {
    await homePage.navigateToPage();
    await homePage.assertIsOnPage();
  });

  await test.step("wait for opener and home readiness", async () => {
    await homePage.expectIntroToAppear();
    await homePage.expectHomeToBeReady();
  });

  await test.step("verify the compact home content", async () => {
    await homePage.assertProfileContent();
    await homePage.assertExperiencePreviewContent();
    await homePage.assertProjectsPreviewContent();
    await homePage.assertContactContent();
  });
});
