import { test } from "@playwright/test";
import { ProjectDetailsPage } from "../../helpers/page-objects/project-details.page";
import { ProjectsPage } from "../../helpers/page-objects/projects.page";

test("user opens a non-featured project from the projects list", async ({
  page,
}) => {
  const projectsPage = new ProjectsPage(page);
  const projectDetailsPage = new ProjectDetailsPage(page);

  await test.step("navigate to the projects page", async () => {
    await projectsPage.navigateToPage();
    await projectsPage.assertIsOnPage();
    await projectsPage.assertContent();
  });

  await test.step("open the second project from the list", async () => {
    await projectsPage.openSecondProject();
    await projectDetailsPage.assertIsOnProject(1);
  });
});
