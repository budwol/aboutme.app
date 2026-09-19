import { expect, test } from "@playwright/test";

for (const path of ["/", "/index.html", "/sw.js", "/logo.png"]) {
  test(`serves security headers on ${path}`, async ({ request }) => {
    const response = await request.get(path);
    expect(response.ok()).toBe(true);

    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["strict-transport-security"]).toContain("max-age=31536000");
    expect(headers["content-security-policy"]).toContain(
      "frame-ancestors 'self'",
    );
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
  });
}

test("keeps security headers on a built JavaScript asset", async ({
  request,
}) => {
  const html = await (await request.get("/index.html")).text();
  const assetPath = html.match(/<script[^>]+src="([^"]+\.js)"/)?.[1];
  expect(assetPath).toBeTruthy();

  const response = await request.get(assetPath!);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("javascript");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'self'",
  );
});

test("keeps security headers on a 404 response", async ({ request }) => {
  const response = await request.get("/missing-security-test.map");
  expect(response.status()).toBe(404);
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'self'",
  );
});
