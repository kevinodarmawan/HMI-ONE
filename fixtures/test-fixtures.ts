import { test as base, expect } from '@playwright/test';
import { requiredEnv } from '../config/environment';
import { SMOKE_RENDER_DELAY_MS } from '../config/testTiming';
import { AppointmentBookingPage } from '../pages/AppointmentBookingPage';
import { AppointmentsPage } from '../pages/AppointmentsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { LoginPage } from '../pages/LoginPage';

type TestFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  bookingPage: AppointmentBookingPage;
  appointmentsPage: AppointmentsPage;
  forgotPasswordPage: ForgotPasswordPage;
  authenticatedDashboard: DashboardPage;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  bookingPage: async ({ page }, use) => {
    await use(new AppointmentBookingPage(page));
  },
  appointmentsPage: async ({ page }, use) => {
    await use(new AppointmentsPage(page));
  },
  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page));
  },
  authenticatedDashboard: async ({ loginPage, dashboardPage }, use, testInfo) => {
    const renderDelayMs = testInfo.tags.includes('@smoke')
      ? SMOKE_RENDER_DELAY_MS
      : 0;
    await loginPage.login(
      requiredEnv('TEST_USER_EMAIL'),
      requiredEnv('TEST_USER_PASSWORD'),
      renderDelayMs,
    );
    await dashboardPage.expectLoaded();
    await use(dashboardPage);
  },
});

export { expect };
