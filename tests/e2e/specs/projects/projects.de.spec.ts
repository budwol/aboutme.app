import { test } from "@playwright/test";
import { ProjectsPage } from "../../helpers/page-objects/projects.page";

test.use({ locale: "de-DE" });

test("user opens the german projects route and sees german project content", async ({
  page,
}) => {
  const projectsPage = new ProjectsPage(page);

  await test.step("navigate to the german projects page", async () => {
    await projectsPage.navigateToGermanPage();
    await projectsPage.assertGermanIsOnPage();
  });

  await test.step("verify the german projects page content", async () => {
    await projectsPage.assertGermanContent();
  });
});
