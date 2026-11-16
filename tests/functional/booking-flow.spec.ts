import { test, expect } from '../../fixtures/test-fixtures';
import { appointmentTestData } from '../../test-data/appointments';

test.describe('Appointment booking @functional @read-only @appointments', () => {
  test('FT-BOOK-P01 advances the earliest specialist slot to personal details', async ({
    authenticatedDashboard,
    bookingPage,
    page,
  }) => {
    const specialistName = appointmentTestData.specialist.name;
    await authenticatedDashboard.openSpecialists();
    await bookingPage.startSpecialistAppointment(specialistName);

    const earliestSlotNext = page.getByRole('button', { name: 'Next', exact: true }).first();
    await expect(earliestSlotNext).toBeEnabled();
    await earliestSlotNext.click();

    await expect(page.getByRole('heading', { name: 'Your Personal Details' })).toBeVisible();
    await expect(page.getByText(specialistName, { exact: true }).last()).toBeVisible();

    const consents = page.getByRole('checkbox');
    await expect(consents).toHaveCount(2);
    await expect(consents.nth(0)).not.toBeChecked();
    await expect(consents.nth(1)).not.toBeChecked();
  });

  test('FT-BOOK-P03 selects an available date and time manually', async ({
    authenticatedDashboard,
    bookingPage,
    page,
  }) => {
    await authenticatedDashboard.openSpecialists();
    await bookingPage.startSpecialistAppointment(appointmentTestData.specialist.name);

    const calendar = page.getByRole('listbox', { name: /month/i });
    const availableDates = calendar.getByRole('option', { name: /^Choose / });
    await expect(availableDates.first()).toBeVisible();
    const availableDate = availableDates.nth(Math.min(1, (await availableDates.count()) - 1));
    await availableDate.click();
    await expect(availableDate).toHaveAttribute('aria-selected', 'true');

    const timeSlots = page.getByRole('radio');
    await expect(timeSlots.first()).toBeVisible();
    const timeSlot = timeSlots.nth(Math.min(1, (await timeSlots.count()) - 1));
    await expect(timeSlot).toBeEnabled();
    await timeSlot.check();
    await expect(timeSlot).toBeChecked();
    await expect(page.getByRole('heading', { name: 'Choose a date & time' })).toBeVisible();
  });

  test('FT-BOOK-N01 prevents selecting an unavailable date', async ({
    authenticatedDashboard,
    bookingPage,
    page,
  }) => {
    await authenticatedDashboard.openSpecialists();
    await bookingPage.startSpecialistAppointment(appointmentTestData.specialist.name);

    const calendar = page.getByRole('listbox', { name: /month/i });
    if (!(await calendar.isVisible())) {
      await page.getByRole('heading', { name: 'Or Select Date & Time', exact: true }).click();
    }
    await expect(calendar).toBeVisible({ timeout: 30_000 });

    const unavailableDate = calendar.getByRole('option', { name: /^Not available/ }).first();
    await expect(unavailableDate).toBeVisible();
    await expect(unavailableDate).toBeDisabled();
  });
});
