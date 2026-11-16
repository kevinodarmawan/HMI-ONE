import { test, expect } from '../../fixtures/test-fixtures';
import type { Page } from '@playwright/test';

async function blockPostRequests(page: Page): Promise<string[]> {
  const postPaths: string[] = [];
  await page.route('**/*', async (route) => {
    if (route.request().method() === 'POST') {
      postPaths.push(new URL(route.request().url()).pathname);
      await route.abort();
      return;
    }
    await route.continue();
  });
  return postPaths;
}

test.describe('Authentication form validation @functional @read-only @auth', () => {
  test('FT-AUTH-N01 rejects empty login without submitting', async ({
    loginPage,
    page,
  }) => {
    await loginPage.open();
    const postPaths = await blockPostRequests(page);

    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(
      page.getByText('Please enter a valid email address (e.g. janedoe@email.com)'),
    ).toBeVisible();
    await expect(page.getByText(/password is a required field/i)).toBeVisible();
    expect(postPaths).toHaveLength(0);
  });

  test('FT-REG-N01 rejects empty registration without submitting', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Register an account/ }).click();
    await expect(page.getByRole('heading', { name: 'Account Registration' })).toBeVisible();
    const postPaths = await blockPostRequests(page);

    await page.getByRole('button', { name: 'Register', exact: true }).click();

    await expect(page.getByText('Please provide a full name')).toBeVisible();
    await expect(page.getByText('Please select gender')).toBeVisible();
    await expect(
      page.getByText('Please enter a valid email address (e.g. janedoe@email.com)'),
    ).toBeVisible();
    await expect(page.getByText('Please acknowledge and check the box above')).toBeVisible();
    expect(postPaths).toHaveLength(0);
  });

  test('FT-PWD-N01 rejects empty and malformed reset emails without sending', async ({
    forgotPasswordPage,
    loginPage,
    page,
  }) => {
    await loginPage.open();
    await loginPage.openPasswordReset();
    const postPaths = await blockPostRequests(page);

    await forgotPasswordPage.sendResetEmailButton.click();
    await expect(
      page.getByText('Please enter a valid email address (e.g. janedoe@email.com)'),
    ).toBeVisible();

    await forgotPasswordPage.emailInput.fill('not-an-email');
    await forgotPasswordPage.sendResetEmailButton.click();
    await expect(
      page.getByText('Please enter a valid email address (e.g. janedoe@email.com)'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/reset-password\/?$/);
    expect(postPaths).toHaveLength(0);
  });
});

test.describe('Contact form validation @functional @read-only @contact', () => {
  test('FT-CONTACT-N01 validates empty and malformed fields without submitting', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Contact Us', exact: true }).click();
    const postPaths = await blockPostRequests(page);

    await page.getByRole('button', { name: 'Submit', exact: true }).click();

    await expect(page.getByText('Please select a topic')).toBeVisible();
    await expect(page.getByText('Please provide a full name')).toBeVisible();
    await expect(
      page.getByText('Please enter a valid email address (e.g. janedoe@email.com)'),
    ).toBeVisible();
    await expect(page.getByText('Please enter a valid mobile number')).toBeVisible();
    await expect(page.getByText('This field is required')).toBeVisible();

    await page.getByRole('textbox', { name: 'Email *' }).fill('not-an-email');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(
      page.getByText('Please enter a valid email address (e.g. janedoe@email.com)'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/contact-us\/?$/);
    expect(postPaths).toHaveLength(0);
  });
});
