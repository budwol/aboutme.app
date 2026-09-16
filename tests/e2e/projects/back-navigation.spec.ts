import { expect, test } from "@playwright/test";
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

test("keeps the projects list's scroll position when navigating back to it", async ({
  page,
}) => {
  // Regression test: WnaProjectsRoute mounts fresh on every visit (see
  // wnaRouteTable.ts), same as every other route -- without an explicit
  // save/restore (see useWnaScrollY.ts), going back from a project's
  // detail page always landed scrolled to the top.
  const projectsPage = new ProjectsPage(page);
  const projectDetailsPage = new ProjectDetailsPage(page);

  // Shrink the viewport so the fixture's project list actually overflows
  // -- at the desktop project's normal 1440x1100 it fits without
  // scrolling at all with this test's fixture data, which would make
  // this test pass vacuously regardless of whether restoration works.
  await page.setViewportSize({ width: 1440, height: 500 });

  await test.step("navigate to the projects page and scroll down", async () => {
    await projectsPage.navigateToPage();
    await projectsPage.assertIsOnPage();
    await projectsPage.scrollMainContentBy(400);
  });

  const scrollTopBeforeLeaving = await projectsPage.getMainContentScrollTop();
  expect(scrollTopBeforeLeaving).toBeGreaterThan(0);

  await test.step("open a project and navigate back", async () => {
    // The featured (first) project sits near the top of the page --
    // clicking it here would make Playwright scroll back up to bring it
    // into view first, overwriting the position this test is checking.
    // The second, grid-listed project sits further down, closer to
    // where this test just scrolled to.
    await projectsPage.openSecondProject();
    await projectDetailsPage.assertIsOnProject(1);
    await projectDetailsPage.goBack();
    await projectsPage.assertIsOnPage();
  });

  await expect
    .poll(() => projectsPage.getMainContentScrollTop())
    .toBe(scrollTopBeforeLeaving);
});
