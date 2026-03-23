import { test } from "@playwright/test";
import { ProjectsPage } from "../../helpers/page-objects/projects.page";

test("user opens the projects page on a mobile viewport and sees the highlights and first project", async ({
  page,
}) => {
  const projectsPage = new ProjectsPage(page);

  await test.step("navigate to the projects page on mobile", async () => {
    await projectsPage.navigateToPage();
    await projectsPage.assertIsOnPage();
  });

  await test.step("verify mobile projects content", async () => {
    await projectsPage.assertMobileContent();
  });
});
