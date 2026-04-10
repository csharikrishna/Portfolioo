import { expect, test } from "@playwright/test";

test("home page renders key sections", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/AI Systems & Backend Engineering/i);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const projectsHeading = page.getByRole("heading", { name: "Projects" });
  await projectsHeading.scrollIntoViewIfNeeded();
  await expect(projectsHeading).toBeVisible();
});
