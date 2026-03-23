import { test } from "@playwright/test";
import { FallbackPage } from "../../helpers/page-objects/fallback.page";

test("user opens an unknown project route on a mobile portrait viewport and is redirected to the projects page", async ({
  page,
}) => {
  const fallbackPage = new FallbackPage(page);

  await test.step("navigate to an unknown project route", async () => {
    await fallbackPage.navigateToUnknownProjectRouteMobile();
  });

  await test.step("verify the route falls back to the projects page", async () => {
    await fallbackPage.assertRedirectedToProjects();
  });
});
