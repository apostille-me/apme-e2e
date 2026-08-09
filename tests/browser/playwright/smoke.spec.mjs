import { expect, test } from "@playwright/test";

test("apme-e2e renders its offline contract marker", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator("main[data-e2e-ready='true']")).toHaveAttribute("data-suite", "apme-e2e");
  const health = await request.get("/healthz");
  expect(health.ok()).toBeTruthy();
  expect(await health.json()).toEqual({ ok: true, suite: "apme-e2e" });
});
