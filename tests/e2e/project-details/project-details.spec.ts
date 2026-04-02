import { test } from "@playwright/test";
import { ProjectDetailsPage } from "../../helpers/page-objects/project-details.page";

test("user opens a private project repository action and sees the review modal", async ({
  page,
}) => {
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
});
