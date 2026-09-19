import { expect, test } from "@playwright/test";

test("loads the app without CSP violations", async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { cspViolations: string[] }).cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      (
        window as typeof window & { cspViolations: string[] }
      ).cspViolations.push(`${event.effectiveDirective}: ${event.blockedURI}`);
    });
  });

  await page.goto("/");
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect
    .poll(() => page.evaluate(() => document.readyState))
    .toBe("complete");
  const violations = await page.evaluate(
    () => (window as typeof window & { cspViolations: string[] }).cspViolations,
  );
  expect(violations).toEqual([]);
});
