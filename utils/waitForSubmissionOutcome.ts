import { expect, type Locator, type Page } from '@playwright/test';

export async function waitForSubmissionOutcome(
  page: Page,
  successMessage: Locator,
  action: string,
): Promise<void> {
  const applicationError = page.getByRole('heading', {
    name: 'We are sorry, something went wrong',
  });
  const bookingRejected = page.getByRole('heading', {
    name: 'Sorry, your booking is unsuccessful.',
  });

  await expect(successMessage.or(applicationError).or(bookingRejected).first()).toBeVisible({
    timeout: 30_000,
  });

  if (await applicationError.isVisible()) {
    throw new Error(`${action} failed: the application displayed its generic error page.`);
  }
  if (await bookingRejected.isVisible()) {
    const reason = await page
      .getByText(/Please pick an appointment date and time that does not clash/i)
      .innerText();
    throw new Error(`${action} was rejected by the application: ${reason}`);
  }

  await expect(successMessage).toBeVisible();
}
