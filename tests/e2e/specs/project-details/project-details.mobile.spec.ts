import { test } from "@playwright/test";
import { ProjectDetailsPage } from "../../helpers/page-objects/project-details.page";

test("user opens project details on a mobile portrait viewport and can open the repo modal", async ({
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

  await test.step("open the private repository modal from the portrait actions", async () => {
    await projectDetailsPage.openPrivateRepoModal();
    await projectDetailsPage.assertPrivateRepoModal();
  });
});
