import { test } from "@playwright/test";
import { ProjectDetailsPage } from "../../helpers/page-objects/project-details.page";

test("user opens the web app, play store, and repo contact actions from project details", async ({
  page,
}) => {
  const projectDetailsPage = new ProjectDetailsPage(page);

  await test.step("navigate to the project details page", async () => {
    await projectDetailsPage.navigateToPage();
    await projectDetailsPage.assertIsOnPage();
    await projectDetailsPage.assertContent();
  });

  await test.step("open the web app action", async () => {
    await projectDetailsPage.prepareExternalUrlCapture();
    await projectDetailsPage.openWebApp();
    await projectDetailsPage.assertLastOpenedUrlMatches(
      /pizza-app\.example\.com/,
    );
  });

  await test.step("open the play store action", async () => {
    await projectDetailsPage.prepareExternalUrlCapture();
    await projectDetailsPage.openPlayStore();
    await projectDetailsPage.assertLastOpenedUrlMatches(/play\.google\.com/);
  });

  await test.step("open the private repo email action", async () => {
    await projectDetailsPage.openPrivateRepoModal();
    await projectDetailsPage.assertPrivateRepoModal();
    await projectDetailsPage.prepareExternalUrlCapture();
    await projectDetailsPage.openPrivateRepoEmailAction();
    await projectDetailsPage.assertLastOpenedUrlMatches(/^mailto:/);
  });
});
