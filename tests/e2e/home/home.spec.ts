import { expect, test } from "@playwright/test";
import { HomePage } from "../../helpers/page-objects/home.page";
import { ProjectsPage } from "../../helpers/page-objects/projects.page";

test("user visits the root page, sees the opener, then the complete home screen", async ({
  page,
}) => {
  const homePage = new HomePage(page);

  await test.step("navigate to the home page", async () => {
    await homePage.navigateToPage();
    await homePage.assertIsOnPage();
  });

  await test.step("wait for opener and home readiness", async () => {
    await homePage.expectIntroToAppear();
    await homePage.expectHomeToBeReady();
  });

  await test.step("verify profile, experience, projects, and contact content", async () => {
    await homePage.assertProfileContent();
    await homePage.assertExperiencePreviewContent();
    await homePage.assertProjectsPreviewContent();
    await homePage.assertContactContent();
  });
});

test("keeps the home page's scroll position when navigating back to it", async ({
  page,
}) => {
  // Regression test: every route mounts a fresh scroll container (see
  // wnaRouteTable.ts and useWnaScrollY.ts), so without an explicit
  // save/restore mechanism, going back from another page always landed
  // scrolled to the top -- easy to miss since it isn't a full page
  // reload (no navigation/load event fires), just a lost scroll position.
  const homePage = new HomePage(page);
  const projectsPage = new ProjectsPage(page);

  await test.step("navigate to home and scroll down", async () => {
    await homePage.navigateToPage();
    await homePage.expectIntroToAppear();
    await homePage.expectHomeToBeReady();
    await homePage.scrollMainContentBy(600);
  });

  const scrollTopBeforeLeaving = await homePage.getMainContentScrollTop();
  expect(scrollTopBeforeLeaving).toBeGreaterThan(0);

  await test.step("navigate away and back", async () => {
    // Uses the always-visible header button rather than the in-content
    // "Show more" link: clicking a link near the bottom of the page would
    // make Playwright auto-scroll it into view first, overwriting the
    // scroll position this test is trying to verify survives navigation.
    await homePage.openProjectsPageFromHeader();
    // Navigating away preloads the target route's chunk before the URL
    // actually changes (see useWnaNavigationTransition.ts), so this must
    // wait for the real navigation to land before going back -- otherwise
    // goBack() fires while still on "/" and does nothing meaningful.
    await projectsPage.assertIsOnPage();
    await page.goBack();
    await homePage.expectHomeToBeReady();
  });

  await expect
    .poll(() => homePage.getMainContentScrollTop())
    .toBe(scrollTopBeforeLeaving);
});
