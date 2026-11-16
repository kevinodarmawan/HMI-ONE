import type { Page } from '@playwright/test';

export async function waitForTransitionRender(
  page: Page,
  delayMs = 0,
): Promise<void> {
  if (delayMs > 0) {
    await page.waitForTimeout(delayMs);
  }
}
