import { test } from "@playwright/test";
import { stubGithubRoute } from "../../helpers/external-routes";
import { ContactPage } from "../../helpers/page-objects/contact.page";

test("user sees all contact actions and can open the github profile", async ({
  page,
}) => {
  const contactPage = new ContactPage(page);

  await test.step("stub the github target", async () => {
    await stubGithubRoute(page);
  });

  await test.step("navigate to the contact page and verify its content", async () => {
    await contactPage.navigateToPage();
    await contactPage.assertIsOnPage();
    await contactPage.assertContent();
  });

  await test.step("open the github profile from the contact actions", async () => {
    await contactPage.openGithubProfile();
    await contactPage.assertIsOnGithubPage();
  });
});
