import { test } from "@playwright/test";
import { ExperiencePage } from "../../helpers/page-objects/experience.page";
import { HomePage } from "../../helpers/page-objects/home.page";

test("user reviews experience items, toggles details, and navigates to the experience page", async ({
  page,
}) => {
  const homePage = new HomePage(page);
  const experiencePage = new ExperiencePage(page);

  await test.step("navigate to home and wait for readiness", async () => {
    await homePage.navigateToPage();
    await homePage.assertIsOnPage();
    await homePage.expectIntroToAppear();
    await homePage.expectHomeToBeReady();
  });

  await test.step("verify the experience preview content", async () => {
    await homePage.assertExperiencePreviewContent();
  });

  await test.step("expand and collapse the first experience item", async () => {
    await homePage.expandFirstExperienceItem();
    await homePage.assertFirstExperienceItemExpanded();
    await homePage.collapseFirstExperienceItem();
    await homePage.assertFirstExperienceItemCollapsed();
  });

  await test.step("navigate to the experience page and verify it", async () => {
    await homePage.openExperiencePage();
    await experiencePage.assertIsOnPage();
  });

  await test.step("verify the full experience page content", async () => {
    await experiencePage.assertContent();
  });
});
