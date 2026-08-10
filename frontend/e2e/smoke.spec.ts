import { test, expect } from '@playwright/test';

test('public pages render core UI', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Thhiya/i);

  await page.goto('/pricing');
  await expect(page.getByRole('heading', { name: /Choose Your Plan/i })).toBeVisible();

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /Welcome Back/i })).toBeVisible();
});
