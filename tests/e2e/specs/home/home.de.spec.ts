import { test } from "@playwright/test";
import { HomePage } from "../../helpers/page-objects/home.page";

test.use({ locale: "de-DE" });

test("user opens the root page with german locale and sees german home content", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  await test.step("navigate to the german home page", async () => {
    await homePage.navigateToGermanPage();
    await homePage.assertGermanIsOnPage();
  });

  await test.step("wait for german opener and home readiness", async () => {
    await homePage.expectGermanIntroToAppear();
    await homePage.expectGermanHomeToBeReady();
  });

  await test.step("verify german home content", async () => {
    await homePage.assertGermanContent();
  });
});
