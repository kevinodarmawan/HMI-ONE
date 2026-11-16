import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { DateTimePicker } from './DateTimePicker';
import { waitForSubmissionOutcome } from '../utils/waitForSubmissionOutcome';
import { waitForTransitionRender } from '../utils/waitForTransitionRender';

export class AppointmentBookingPage {
  readonly page: Page;
  readonly dateTimePicker: DateTimePicker;
  private selectedSpecialist: string | undefined;

  constructor(page: Page) {
    this.page = page;
    this.dateTimePicker = new DateTimePicker(page);
  }

  private doctorCard(doctorName: string): Locator {
    return this.page
      .getByText(doctorName, { exact: true })
      .locator('xpath=ancestor::div[.//button[normalize-space(.)="Make Appointment"]][1]');
  }

  private screeningCard(packageName: string): Locator {
    return this.page
      .getByRole('heading', { name: packageName, exact: true })
      .locator('xpath=ancestor::div[.//button[normalize-space(.)="Book Now"]][1]');
  }

  async startSpecialistAppointment(doctorName: string, renderDelayMs = 0): Promise<void> {
    this.selectedSpecialist = doctorName;
    await this.doctorCard(doctorName)
      .getByRole('button', { name: 'Make Appointment' })
      .click();
    await expect(this.page).toHaveURL(/\/appointments\/make\//);
    await expect(this.page.getByRole('heading', { name: 'Choose a date & time' })).toBeVisible();
    await expect(this.page.getByText(doctorName, { exact: true })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Next', exact: true }).first())
      .toBeEnabled({ timeout: 30_000 });
    await waitForTransitionRender(this.page, renderDelayMs);
  }

  async startScreeningAppointment(packageName: string, renderDelayMs = 0): Promise<void> {
    await this.page.getByRole('tab', { name: 'Health Screening' }).click();
    await expect(this.page.getByRole('button', { name: 'Book Now' }).first()).toBeVisible();
    await this.screeningCard(packageName).getByRole('button', { name: 'Book Now' }).click();
    await expect(this.page).toHaveURL(/\/appointments\/screening\//);
    await expect(
      this.page.getByRole('heading', { name: packageName, exact: true }),
    ).toBeVisible();
    await expect(
      this.page.getByRole('heading', { name: 'Choose your preferred specialist' }),
    ).toBeVisible({ timeout: 30_000 });
    await waitForTransitionRender(this.page, renderDelayMs);
  }

  async selectScreeningSpecialist(specialistName: string, renderDelayMs = 0): Promise<void> {
    this.selectedSpecialist = specialistName;
    await this.page.getByText(specialistName, { exact: true }).click();
    const nextButton = this.page.getByRole('button', { name: 'Next' });
    await expect(nextButton).toBeEnabled();
    await expect(this.page.getByText(specialistName, { exact: true }).last()).toBeVisible();
    await nextButton.click();
    await expect(
      this.page.getByRole('heading', { name: 'Choose your preferred date & time' }),
    ).toBeVisible();
    await waitForTransitionRender(this.page, renderDelayMs);
  }

  async selectDateAndTime(date: string, time: string): Promise<void> {
    if (!this.selectedSpecialist) {
      throw new Error('A specialist must be selected before choosing an appointment slot.');
    }
    await this.dateTimePicker.selectDateAndTime(date, time);
  }

  async continueToPersonalDetails(renderDelayMs = 0): Promise<void> {
    if (!this.selectedSpecialist) {
      throw new Error('A specialist must be selected before continuing to personal details.');
    }
    await this.dateTimePicker.continueToPersonalDetails(renderDelayMs);
    await expect(this.page.getByText(this.selectedSpecialist, { exact: true }).last()).toBeVisible();
  }

  async submitWithRequiredConsents(renderDelayMs = 0): Promise<void> {
    await this.dateTimePicker.expectSelectedSummary();
    const consents = this.page.getByRole('checkbox');
    await expect(consents).toHaveCount(2);
    await consents.nth(0).check();
    await consents.nth(1).check();
    await expect(consents.nth(0)).toBeChecked();
    await expect(consents.nth(1)).toBeChecked();

    const submitButton = this.page.getByRole('button', { name: 'Submit' });
    await expect(submitButton).toBeEnabled();
    const apiResponses: Array<Promise<string>> = [];
    const recordApiResponse = (response: Response): void => {
      const request = response.request();
      const url = new URL(response.url());
      if (
        request.method() === 'POST' &&
        ['fetch', 'xhr'].includes(request.resourceType()) &&
        url.pathname === '/la/hmi'
      ) {
        apiResponses.push((async () => {
          const label = `${url.pathname}: HTTP ${response.status()}`;
          if (response.status() < 400) {
            return label;
          }
          let body: string;
          try {
            body = await response.text();
          } catch {
            return `${label} (response body unavailable)`;
          }
          const category = /conflict|clash|already.{0,40}appointment/i.test(body)
            ? 'appointment conflict'
            : /invalid|required|validation|missing/i.test(body)
              ? 'input validation'
              : /unauthori[sz]ed|token|session|expired/i.test(body)
                ? 'authentication/session'
                : 'unclassified application rejection';
          return `${label} (${category})`;
        })());
      }
    };
    this.page.on('response', recordApiResponse);
    try {
      await submitButton.click();
      await waitForSubmissionOutcome(
        this.page,
        this.page.getByText('Appointment confirmed'),
        'Appointment booking',
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('application displayed its generic error page') &&
        apiResponses.length
      ) {
        const responses = Array.from(new Set(await Promise.all(apiResponses))).join(', ');
        throw new Error(`${error.message} API response(s): ${responses}`);
      }
      throw error;
    } finally {
      this.page.off('response', recordApiResponse);
      await waitForTransitionRender(this.page, renderDelayMs);
    }
  }
}
