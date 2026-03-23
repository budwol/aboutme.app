import { test } from "@playwright/test";
import { ExperiencePage } from "../../helpers/page-objects/experience.page";

test.use({ locale: "de-DE" });

test("user opens the german experience route and sees german experience content", async ({
  page,
}) => {
  const experiencePage = new ExperiencePage(page);

  await test.step("navigate to the german experience page", async () => {
    await experiencePage.navigateToGermanPage();
    await experiencePage.assertGermanIsOnPage();
  });

  await test.step("verify the german experience page content", async () => {
    await experiencePage.assertGermanContent();
  });
});
