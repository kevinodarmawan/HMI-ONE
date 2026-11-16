import { expect, type Locator, type Page } from '@playwright/test';
import {
  formatAppointmentSummaryDate,
  formatCalendarDateLabel,
  parseAppointmentDate,
} from '../utils/appointmentDate';
import { waitForTransitionRender } from '../utils/waitForTransitionRender';

export class AppointmentSlotConflictError extends Error {
  constructor(date: string, time: string) {
    super(`Reschedule slot ${date} ${time} conflicts with an existing appointment.`);
    this.name = 'AppointmentSlotConflictError';
  }
}

export class DateTimePicker {
  readonly page: Page;
  private selectedSummary: RegExp | undefined;

  constructor(page: Page) {
    this.page = page;
  }

  async selectDateAndTime(dateValue: string, timeValue: string): Promise<void> {
    const date = parseAppointmentDate(dateValue);
    const dateLabel = formatCalendarDateLabel(date);

    await expect(
      this.page.getByRole('heading', {
        name: /(?:Choose (?:a |your preferred )?date & time|Pick your new appointment date and time)/i,
      }),
    ).toBeVisible();
    const calendar = this.page.getByRole('listbox', { name: /month/i });
    if (!(await calendar.isVisible())) {
      const selectDateHeading = this.page.getByRole('heading', {
        name: 'Or Select Date & Time',
        exact: true,
      });
      if (await selectDateHeading.isVisible()) {
        await selectDateHeading.click();
      }
    }
    await expect(calendar).toBeVisible({ timeout: 30_000 });

    const unavailableDate = this.page.getByRole('option', {
      name: `Not available ${dateLabel}`,
      exact: true,
    });
    const availableDate = this.page.getByRole('option', {
      name: `Choose ${dateLabel}`,
      exact: true,
    });
    await expect(availableDate.or(unavailableDate).first()).toBeVisible({
      timeout: 30_000,
    });

    if (await unavailableDate.count()) {
      throw new Error(`Requested appointment date ${dateValue} is unavailable.`);
    }

    await availableDate.click();
    await expect(availableDate).toHaveAttribute('aria-selected', 'true');

    const timeSlot = this.page.getByRole('radio', { name: timeValue, exact: true });
    await expect(timeSlot).toBeVisible({ timeout: 30_000 });
    await expect(timeSlot).toBeEnabled();
    await timeSlot.check();
    await expect(timeSlot).toBeChecked();
    const displayTime = timeValue.replace(/^0(?=\d:)/, '');
    this.selectedSummary = new RegExp(
      `${formatAppointmentSummaryDate(date)},?\\s*${displayTime}`,
    );
  }

  async continueToPersonalDetails(renderDelayMs = 0): Promise<void> {
    const nextButton = this.page.getByRole('button', { name: 'Next' }).last();
    await expect(nextButton).toBeEnabled();
    await nextButton.click();
    await expect(this.page.getByRole('heading', { name: 'Your Personal Details' })).toBeVisible();
    await this.expectSelectedSummary();
    await waitForTransitionRender(this.page, renderDelayMs);
  }

  async expectSelectedSummary(container: Locator = this.page): Promise<void> {
    if (!this.selectedSummary) {
      throw new Error('Select an appointment date and time before checking the summary.');
    }
    await expect(container.getByText(this.selectedSummary)).toBeVisible({
      timeout: 30_000,
    });
  }
}
