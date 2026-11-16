import { test, expect } from '../../fixtures/test-fixtures';
import { requiredEnv } from '../../config/environment';
import { appointmentTestData } from '../../test-data/appointments';

test.describe('Authentication @functional @read-only @auth', () => {
  test('FT-AUTH-P01 logs in with valid credentials', async ({
    loginPage,
    dashboardPage,
  }) => {
    await loginPage.login(
      requiredEnv('TEST_USER_EMAIL'),
      requiredEnv('TEST_USER_PASSWORD'),
    );
    await dashboardPage.expectLoaded();
  });
});

test.describe('Dashboard navigation @functional @read-only @dashboard @appointments', () => {
  test('FT-DASH-P01 opens the specialist listing', async ({
    authenticatedDashboard,
    page,
  }) => {
    await authenticatedDashboard.openSpecialists();

    await expect(page.getByRole('tab', { name: 'Specialists' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Make Appointment' }).first()).toBeVisible();
  });

  test('FT-DASH-P02 opens the screening package listing', async ({
    authenticatedDashboard,
    page,
  }) => {
    await authenticatedDashboard.openScreenings();

    await expect(page.getByRole('tab', { name: 'Health Screening' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Book Now' }).first()).toBeVisible();
  });

  test('FT-DASH-P03 opens upcoming and past appointments', async ({
    authenticatedDashboard,
    page,
  }) => {
    await authenticatedDashboard.openAppointments();

    await expect(page.getByText('Upcoming Appointments', { exact: true })).toBeVisible();
    await expect(page.getByText('Past Appointments', { exact: true })).toBeVisible();
  });
});

test.describe('Specialist listing @functional @read-only @appointments', () => {
  test('FT-SPEC-P03 exposes the doctor profile destination', async ({
    authenticatedDashboard,
    page,
  }) => {
    await authenticatedDashboard.openSpecialists();

    const doctorCard = page
      .getByText(appointmentTestData.specialist.name, { exact: true })
      .locator('xpath=ancestor::div[.//button[normalize-space(.)="Make Appointment"]][1]');
    const profileLink = doctorCard.getByRole('link', { name: 'View Profile' });

    await expect(profileLink).toHaveAttribute('target', '_blank');
    await expect(profileLink).toHaveAttribute(
      'href',
      /^https:\/\/www\.hmimedical\.com\/doctors\/.+/,
    );
  });
});

test.describe('Health screening @functional @read-only @appointments', () => {
  test('FT-SCR-P01 opens the selected screening booking step', async ({
    authenticatedDashboard,
    page,
  }) => {
    const packageName = appointmentTestData.screening.packageName;
    await authenticatedDashboard.openScreenings();

    const packageCard = page
      .getByRole('heading', { name: packageName, exact: true })
      .locator('xpath=ancestor::div[.//button[normalize-space(.)="Book Now"]][1]');
    await packageCard.getByRole('button', { name: 'Book Now' }).click();

    await expect(page).toHaveURL(/\/appointments\/screening\/?(?:\?.*)?$/);
    await expect(page.getByRole('heading', { name: packageName, exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Choose your preferred specialist' }),
    ).toBeVisible({ timeout: 30_000 });
  });

  test('FT-SCR-N01 does not advance without a screening specialist', async ({
    authenticatedDashboard,
    page,
  }) => {
    const packageName = appointmentTestData.screening.packageName;
    await authenticatedDashboard.openScreenings();

    const packageCard = page
      .getByRole('heading', { name: packageName, exact: true })
      .locator('xpath=ancestor::div[.//button[normalize-space(.)="Book Now"]][1]');
    await packageCard.getByRole('button', { name: 'Book Now' }).click();

    await expect(
      page.getByRole('heading', { name: 'Choose your preferred specialist' }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('button', { name: /^Next/ })).toBeDisabled();
  });
});

test.describe('Medical documents @functional @read-only', () => {
  test('FT-MEDDOC-P01 exposes the Medical Documents destination', async ({
    authenticatedDashboard,
    page,
  }) => {
    const medicalDocumentsLink = page.getByText('View now', { exact: true });

    await expect(medicalDocumentsLink).toHaveAttribute('href', '/medical-documents');
  });
});
