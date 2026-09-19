import { expect, test } from "@playwright/test";

const deployedUrl = process.env.SECURITY_DEPLOYED_URL;

test("deployed site serves security headers over HTTPS", async ({
  request,
}) => {
  test.skip(!deployedUrl, "Set SECURITY_DEPLOYED_URL to check a deployed site");

  const url = new URL(deployedUrl!);
  expect(url.protocol).toBe("https:");
  const response = await request.get(url.href);
  expect(response.ok()).toBe(true);

  const headers = response.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["content-security-policy"]).toContain(
    "frame-ancestors 'self'",
  );
  expect(headers["strict-transport-security"]).toContain("max-age=31536000");
});
