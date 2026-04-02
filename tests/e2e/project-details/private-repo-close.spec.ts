import { test } from "@playwright/test";
import { ProjectDetailsPage } from "../../helpers/page-objects/project-details.page";

test("user closes the private repository modal again", async ({ page }) => {
  const projectDetailsPage = new ProjectDetailsPage(page);

  await test.step("navigate to the project details page", async () => {
    await projectDetailsPage.navigateToPage();
    await projectDetailsPage.assertIsOnPage();
  });

  await test.step("verify the project details content", async () => {
    await projectDetailsPage.assertContent();
  });

  await test.step("open the private repository modal", async () => {
    await projectDetailsPage.openPrivateRepoModal();
    await projectDetailsPage.assertPrivateRepoModal();
  });

  await test.step("close the private repository modal", async () => {
    await projectDetailsPage.closePrivateRepoModal();
    await projectDetailsPage.assertPrivateRepoModalClosed();
  });
});
