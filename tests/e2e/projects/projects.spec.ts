import { test } from "@playwright/test";
import { HomePage } from "../../helpers/page-objects/home.page";
import { ProjectsPage } from "../../helpers/page-objects/projects.page";

test("user navigates from home to the projects page and verifies its content", async ({
  page,
}) => {
  const homePage = new HomePage(page);
  const projectsPage = new ProjectsPage(page);

  await test.step("navigate to home and wait for readiness", async () => {
    await homePage.navigateToPage();
    await homePage.assertIsOnPage();
    await homePage.expectIntroToAppear();
    await homePage.expectHomeToBeReady();
    await homePage.assertProjectsPreviewContent();
  });

  await test.step("navigate to the projects page from home", async () => {
    await homePage.openProjectsPage();
    await projectsPage.assertIsOnPage();
  });

  await test.step("verify the projects page content", async () => {
    await projectsPage.assertContent();
  });
});
