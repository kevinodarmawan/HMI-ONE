import { expect, type Locator, type Page } from '@playwright/test';
import { waitForTransitionRender } from '../utils/waitForTransitionRender';

export class DashboardPage {
  readonly page: Page;
  readonly specialistsLink: Locator;
  readonly packagesLink: Locator;
  readonly appointmentsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.specialistsLink = page.getByRole('link', { name: 'Browse Specialists' });
    this.packagesLink = page.getByRole('link', { name: 'Browse Packages' });
    this.appointmentsLink = page.getByRole('link', { name: 'Appointments', exact: true });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByText('Welcome to HMI One.', { exact: true })).toBeVisible();
  }

  async openSpecialists(renderDelayMs = 0): Promise<void> {
    await this.specialistsLink.click();
    await expect(this.page.getByRole('heading', { name: 'Make an Appointment' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Make Appointment' }).first())
      .toBeVisible({ timeout: 30_000 });
    await waitForTransitionRender(this.page, renderDelayMs);
  }

  async openScreenings(renderDelayMs = 0): Promise<void> {
    await this.packagesLink.click();
    await expect(this.page.getByRole('tab', { name: 'Health Screening' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Book Now' }).first())
      .toBeVisible({ timeout: 30_000 });
    await waitForTransitionRender(this.page, renderDelayMs);
  }

  async openAppointments(renderDelayMs = 0): Promise<void> {
    await this.appointmentsLink.click();
    await expect(this.page.getByText('Upcoming Appointments', { exact: true }))
      .toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByText('Past Appointments', { exact: true }))
      .toBeVisible({ timeout: 30_000 });
    await waitForTransitionRender(this.page, renderDelayMs);
  }
}
