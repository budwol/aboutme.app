import { test } from "@playwright/test";
import { stubGithubRoute } from "../../helpers/external-routes";
import { ProjectDetailsPage } from "../../helpers/page-objects/project-details.page";

test("user continues from the private repo modal to the repository page", async ({
  page,
}) => {
  const projectDetailsPage = new ProjectDetailsPage(page);

  await test.step("stub the github target", async () => {
    await stubGithubRoute(page);
  });

  await test.step("navigate to the project details page", async () => {
    await projectDetailsPage.navigateToPage();
    await projectDetailsPage.assertIsOnPage();
  });

  await test.step("verify the project details content", async () => {
    await projectDetailsPage.assertContent();
  });

  await test.step("continue from the private repository modal to github", async () => {
    await projectDetailsPage.openPrivateRepoModal();
    await projectDetailsPage.assertPrivateRepoModal();
    await projectDetailsPage.continueToRepositoryPage();
    await projectDetailsPage.assertIsOnGithubPage();
  });
});
