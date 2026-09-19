import { expect, test } from "@playwright/test";

test("round buttons keep clipped press feedback on mobile", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#root")).not.toBeEmpty();

  const roundButtons = await page.locator("button").evaluateAll((buttons) =>
    buttons.flatMap((button, index) => {
      const box = button.getBoundingClientRect();
      const style = getComputedStyle(button);
      const radius = Number.parseFloat(style.borderTopLeftRadius);
      if (
        box.width < 40 ||
        Math.abs(box.width - box.height) > 1 ||
        radius < box.width * 0.45
      ) {
        return [];
      }

      return [
        {
          index,
          overflow: style.overflow,
          tapHighlight: style.getPropertyValue("-webkit-tap-highlight-color"),
          radius,
          width: box.width,
        },
      ];
    }),
  );

  expect(roundButtons.length).toBeGreaterThan(0);
  for (const button of roundButtons) {
    expect(button.overflow).toBe("hidden");
    expect(button.tapHighlight).toMatch(/transparent|rgba\(0, 0, 0, 0\)/);
    expect(button.radius).toBeGreaterThanOrEqual(button.width * 0.45);
  }

  const button = page.locator("button").nth(roundButtons[0].index);
  const initialColor = await button.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await button.dispatchEvent("mousedown");
  await expect
    .poll(() =>
      button.evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .not.toBe(initialColor);
  expect(
    await button.evaluate((element) => getComputedStyle(element).overflow),
  ).toBe("hidden");
});
