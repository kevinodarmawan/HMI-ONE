import { test, expect } from '../../fixtures/test-fixtures';
import type { Page } from '@playwright/test';

test.describe('About HMI One @functional @read-only @content', () => {
  test('FT-ABOUT-P01 displays About HMI One content', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'About HMI One', exact: true }).click();

    await expect(page).toHaveURL(/\/about-us\/?$/);
    await expect(page.getByRole('heading', { name: 'What is HMI One?' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Our mission' })).toBeVisible();
    await expect(
      page.getByText('HMI One is a web application to assist patients in their healthcare journey.'),
    ).toBeVisible();
  });
});

test.describe('Frequently asked questions @functional @read-only @content', () => {
  async function openFaqPage(page: Page): Promise<void> {
    await page.goto('/');
    await page.getByRole('link', { name: 'HMI One FAQs', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Frequently Asked Questions About the HMI One' }),
    ).toBeVisible();
  }

  test('FT-FAQ-P01 expands the selected question', async ({ page }) => {
    await openFaqPage(page);

    const firstQuestion = page.getByRole('button', { name: '1. What is the HMI One?' });
    const firstAnswer = firstQuestion.locator('xpath=../..').locator('.accordion-collapse');

    await firstQuestion.click();
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'true');
    await expect(firstAnswer).toBeVisible();
    await expect(firstAnswer).toContainText('streamlined online-offline patient experience');
  });

  test('FT-FAQ-N01 collapses the previous question when another is opened', async ({ page }) => {
    await openFaqPage(page);

    const firstQuestion = page.getByRole('button', { name: '1. What is the HMI One?' });
    const secondQuestion = page.getByRole('button', { name: '2. Who is the HMI One meant for?' });

    await firstQuestion.click();
    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'true');
    await secondQuestion.click();

    await expect(firstQuestion).toHaveAttribute('aria-expanded', 'false');
    await expect(secondQuestion).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('Contact Us @functional @read-only @content @contact', () => {
  test('FT-CONTACT-P01 selects a topic and opens FAQs', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Contact Us', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Contact Us', exact: true })).toBeVisible();

    const topicDropdown = page.locator('.p-dropdown').first();
    await expect(topicDropdown).toBeVisible();
    await topicDropdown.click();

    const topics = page.locator('.p-dropdown-item');
    await expect(topics).toHaveText([
      'Appointment Related',
      'Billing',
      'General Enquiries',
      'HMI One Technical Enquiries',
    ]);
    await page.getByText('General Enquiries', { exact: true }).click();
    await expect(page.locator('.p-dropdown-label')).toHaveText('General Enquiries');

    await page.getByRole('link', { name: 'Visit FAQs', exact: true }).click();
    await expect(page).toHaveURL(/\/faq\/?$/);
    await expect(
      page.getByRole('heading', { name: 'Frequently Asked Questions About the HMI One' }),
    ).toBeVisible();
  });
});

test.describe('Legal and medical documents @functional @read-only @content', () => {
  test('FT-LEGAL-P01 opens Terms and Privacy pages', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Terms of Use & Service', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Terms of Use and Service' })).toBeVisible();

    await page.goto('/');
    await page.getByRole('link', { name: 'Privacy Policy', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Data Privacy Notice' })).toBeVisible();
  });

  test('FT-MEDDOC-N01 requires authentication for Medical Documents', async ({ page }) => {
    await page.goto('/medical-documents');

    await expect(
      page.getByRole('heading', { name: 'Log in or register to access this page' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
  });
});
