import { expect, type Locator, type Page } from '@playwright/test';
import { AppointmentSlotConflictError, DateTimePicker } from './DateTimePicker';
import { formatAppointmentCardDate } from '../utils/appointmentDate';
import { waitForSubmissionOutcome } from '../utils/waitForSubmissionOutcome';
import { waitForTransitionRender } from '../utils/waitForTransitionRender';

export class AppointmentsPage {
  readonly page: Page;
  readonly dateTimePicker: DateTimePicker;

  constructor(page: Page) {
    this.page = page;
    this.dateTimePicker = new DateTimePicker(page);
  }

  async openUpcomingAppointments(): Promise<void> {
    const heading = this.page.getByText('Upcoming Appointments', { exact: true });
    await expect(heading).toBeVisible();
    const firstDetailsLink = this.page.locator('a[href*="/appointments/details/"]').first();
    if (!(await firstDetailsLink.isVisible())) {
      await heading.click();
    }
  }

  async startNewAppointment(renderDelayMs = 0): Promise<void> {
    await this.page.getByText('Make An Appointment', { exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Make an Appointment' })).toBeVisible();
    await waitForTransitionRender(this.page, renderDelayMs);
  }

  private appointmentCard(appointmentName: string, date: string, time: string): Locator {
    const dateLabel = formatAppointmentCardDate(date);
    const timeLabel = time.replace(/^0(?=\d:)/, '');
    return this.page
      .locator('.upcoming-apt-card__wrapper')
      .filter({ hasText: appointmentName })
      .filter({ hasText: dateLabel })
      .filter({ hasText: timeLabel });
  }

  async hasUpcomingAppointment(appointmentName: string, date: string, time: string): Promise<boolean> {
    const count = await this.appointmentCard(appointmentName, date, time).count();
    if (count > 1) {
      throw new Error(
        `Multiple upcoming appointments match ${appointmentName} at ${date} ${time}.`,
      );
    }
    return count === 1;
  }

  async openDetails(
    appointmentName: string,
    date: string,
    time: string,
    renderDelayMs = 0,
  ): Promise<void> {
    const card = this.appointmentCard(appointmentName, date, time);
    await expect(card).toHaveCount(1, { timeout: 30_000 });
    await card.getByRole('link', { name: /Details/ }).click();
    await expect(this.page.getByRole('button', { name: 'Reschedule' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Cancel Appointment' })).toBeVisible();
    await waitForTransitionRender(this.page, renderDelayMs);
  }

  async reschedule(
    doctorName: string,
    originalDate: string,
    originalTime: string,
    newDate: string,
    newTime: string,
    renderDelayMs = 0,
  ): Promise<void> {
    await this.openDetails(doctorName, originalDate, originalTime, renderDelayMs);
    await this.page.getByRole('button', { name: 'Reschedule' }).click();
    const dialog = this.page.getByRole('dialog', { name: 'Reschedule Your Appointment' });
    await expect(dialog).toBeVisible();
    await this.dateTimePicker.selectDateAndTime(newDate, newTime);
    const nextButtons = dialog.getByRole('button', { name: /^Next/ });
    await expect(nextButtons).toHaveCount(2);
    // The first button accepts the default earliest slot; the second uses the manual calendar selection.
    const manualSelectionNext = nextButtons.nth(1);
    await expect(manualSelectionNext).toBeEnabled();
    await manualSelectionNext.click();
    const reviewHeading = dialog.getByRole('heading', {
      name: 'Review your new appointment details',
    });
    const conflictHeading = this.page.getByRole('heading', {
      name: 'Appointment Conflict',
      exact: true,
    });
    await expect(reviewHeading.or(conflictHeading).first()).toBeVisible({
      timeout: 30_000,
    });
    if (await conflictHeading.isVisible()) {
      throw new AppointmentSlotConflictError(newDate, newTime);
    }
    await this.dateTimePicker.expectSelectedSummary(dialog);
    const submitButton = this.page.getByRole('button', { name: 'Submit' });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    try {
      await waitForSubmissionOutcome(
        this.page,
        this.page.getByText(/appointment.{0,40}reschedul/i),
        'Appointment rescheduling',
      );
    } finally {
      await waitForTransitionRender(this.page, renderDelayMs);
    }
  }

  async cancel(
    doctorName: string,
    date: string,
    time: string,
    renderDelayMs = 0,
  ): Promise<void> {
    await this.openDetails(doctorName, date, time, renderDelayMs);
    await this.page.getByRole('button', { name: 'Cancel Appointment' }).click();
    const confirmButton = this.page.getByRole('button', {
      name: 'Yes, Cancel my appointment',
    });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    try {
      await waitForSubmissionOutcome(
        this.page,
        this.page.getByText('Your appointment has been cancelled'),
        'Appointment cancellation',
      );
    } finally {
      await waitForTransitionRender(this.page, renderDelayMs);
    }
  }
}
