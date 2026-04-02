import { test } from "@playwright/test";
import { ProjectDetailsPage } from "../../helpers/page-objects/project-details.page";
import { ProjectsPage } from "../../helpers/page-objects/projects.page";

test("user opens a project and navigates back to the projects list", async ({
  page,
}) => {
  const projectsPage = new ProjectsPage(page);
  const projectDetailsPage = new ProjectDetailsPage(page);

  await test.step("navigate to the projects page", async () => {
    await projectsPage.navigateToPage();
    await projectsPage.assertIsOnPage();
  });

  await test.step("open the first project", async () => {
    await projectsPage.openFirstProject();
    await projectDetailsPage.assertIsOnPage();
  });

  await test.step("navigate back to the projects list", async () => {
    await projectDetailsPage.goBack();
    await projectsPage.assertIsOnPage();
  });
});
