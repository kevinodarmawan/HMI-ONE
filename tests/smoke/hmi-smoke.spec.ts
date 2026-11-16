import {
  requiredEnv,
  runMutatingAppointmentTests,
  runPasswordResetTest,
} from '../../config/environment';
import { SMOKE_RENDER_DELAY_MS } from '../../config/testTiming';
import { expect, test } from '../../fixtures/test-fixtures';
import type { AppointmentBookingPage } from '../../pages/AppointmentBookingPage';
import type { AppointmentsPage } from '../../pages/AppointmentsPage';
import { appointmentTestData } from '../../test-data/appointments';

async function bookSpecialistSmokeAppointment(
  appointmentsPage: AppointmentsPage,
  bookingPage: AppointmentBookingPage,
  date: string,
  time: string,
): Promise<void> {
  await appointmentsPage.startNewAppointment(SMOKE_RENDER_DELAY_MS);
  await bookingPage.startSpecialistAppointment(
    appointmentTestData.reschedule.specialist,
    SMOKE_RENDER_DELAY_MS,
  );
  await bookingPage.selectDateAndTime(date, time);
  await bookingPage.continueToPersonalDetails(SMOKE_RENDER_DELAY_MS);
  await bookingPage.submitWithRequiredConsents(SMOKE_RENDER_DELAY_MS);
}

test.describe('Authentication and navigation @smoke @read-only', () => {
  test.setTimeout(90_000);

  test('TC-LOGIN-001-SMOKE logs in with valid credentials', async ({
    loginPage,
    dashboardPage,
  }) => {
    await loginPage.login(
      requiredEnv('TEST_USER_EMAIL'),
      requiredEnv('TEST_USER_PASSWORD'),
      SMOKE_RENDER_DELAY_MS,
    );
    await dashboardPage.expectLoaded();
  });

  test('TC-FORGOTPWD-001-SMOKE requests a password reset email', async ({
    loginPage,
    forgotPasswordPage,
  }) => {
    test.skip(
      !runPasswordResetTest,
      'Sends a real password-reset email; set RUN_PASSWORD_RESET_TEST=true for a controlled mailbox.',
    );
    await loginPage.open(SMOKE_RENDER_DELAY_MS);
    await loginPage.openPasswordReset(SMOKE_RENDER_DELAY_MS);
    await forgotPasswordPage.requestReset(requiredEnv('TEST_USER_EMAIL'));
    await forgotPasswordPage.expectResetSent();
  });

  test('TC-DASHBOARD-001-SMOKE opens the specialist list', async ({
    authenticatedDashboard,
  }) => {
    await authenticatedDashboard.openSpecialists(SMOKE_RENDER_DELAY_MS);
  });

  test('TC-DASHBOARD-002-SMOKE opens the health-screening list', async ({
    authenticatedDashboard,
  }) => {
    await authenticatedDashboard.openScreenings(SMOKE_RENDER_DELAY_MS);
  });
});

test.describe('Appointment workflows @smoke @mutating', () => {
  test.setTimeout(180_000);

  test.skip(
    !runMutatingAppointmentTests,
    'Creates or changes UAT appointments; set RUN_MUTATING_APPOINTMENT_TESTS=true only for the dedicated QA account.',
  );

  test('TC-APPOINTMENTS-001-SMOKE creates a specialist appointment', async ({
    authenticatedDashboard,
    appointmentsPage,
    bookingPage,
  }) => {
    await authenticatedDashboard.openAppointments(SMOKE_RENDER_DELAY_MS);
    await appointmentsPage.openUpcomingAppointments();
    if (
      await appointmentsPage.hasUpcomingAppointment(
        appointmentTestData.specialist.name,
        appointmentTestData.specialist.date,
        appointmentTestData.specialist.time,
      ) ||
      await appointmentsPage.hasUpcomingAppointment(
        appointmentTestData.reschedule.specialist,
        appointmentTestData.reschedule.newDate,
        appointmentTestData.reschedule.newTime,
      )
    ) {
      return;
    }
    await bookSpecialistSmokeAppointment(
      appointmentsPage,
      bookingPage,
      appointmentTestData.specialist.date,
      appointmentTestData.specialist.time,
    );
  });

  test('TC-APPOINTMENTS-002-SMOKE creates a screening appointment', async ({
    authenticatedDashboard,
    appointmentsPage,
    bookingPage,
  }) => {
    await authenticatedDashboard.openAppointments(SMOKE_RENDER_DELAY_MS);
    await appointmentsPage.openUpcomingAppointments();
    if (
      await appointmentsPage.hasUpcomingAppointment(
        appointmentTestData.screening.packageName,
        appointmentTestData.screening.date,
        appointmentTestData.screening.time,
      )
    ) {
      return;
    }
    await appointmentsPage.startNewAppointment(SMOKE_RENDER_DELAY_MS);
    await bookingPage.startScreeningAppointment(
      appointmentTestData.screening.packageName,
      SMOKE_RENDER_DELAY_MS,
    );
    await bookingPage.selectScreeningSpecialist(
      appointmentTestData.screening.specialist,
      SMOKE_RENDER_DELAY_MS,
    );
    await bookingPage.selectDateAndTime(
      appointmentTestData.screening.date,
      appointmentTestData.screening.time,
    );
    await bookingPage.continueToPersonalDetails(SMOKE_RENDER_DELAY_MS);
    await bookingPage.submitWithRequiredConsents(SMOKE_RENDER_DELAY_MS);
  });

  test('TC-RESCHEDULE-001-SMOKE reschedules the specialist smoke appointment', async ({
    authenticatedDashboard,
    appointmentsPage,
    bookingPage,
  }) => {
    await authenticatedDashboard.openAppointments(SMOKE_RENDER_DELAY_MS);
    await appointmentsPage.openUpcomingAppointments();
    let hasRescheduledAppointment = await appointmentsPage.hasUpcomingAppointment(
      appointmentTestData.reschedule.specialist,
      appointmentTestData.reschedule.newDate,
      appointmentTestData.reschedule.newTime,
    );
    let hasOriginalAppointment = await appointmentsPage.hasUpcomingAppointment(
      appointmentTestData.reschedule.specialist,
      appointmentTestData.reschedule.originalDate,
      appointmentTestData.reschedule.originalTime,
    );
    if (!hasOriginalAppointment && !hasRescheduledAppointment) {
      await bookSpecialistSmokeAppointment(
        appointmentsPage,
        bookingPage,
        appointmentTestData.reschedule.originalDate,
        appointmentTestData.reschedule.originalTime,
      );
      await authenticatedDashboard.openAppointments(SMOKE_RENDER_DELAY_MS);
      await appointmentsPage.openUpcomingAppointments();
      await expect
        .poll(
          () =>
            appointmentsPage.hasUpcomingAppointment(
              appointmentTestData.reschedule.specialist,
              appointmentTestData.reschedule.originalDate,
              appointmentTestData.reschedule.originalTime,
            ),
          { timeout: 30_000 },
        )
        .toBe(true);
      hasOriginalAppointment = true;
    }
    if (hasOriginalAppointment === hasRescheduledAppointment) {
      throw new Error(
        hasOriginalAppointment
          ? 'Both original and rescheduled smoke appointments exist; resolve the duplicate QA data before rescheduling.'
          : 'No specialist smoke appointment exists at either configured slot; the booking smoke case must create it first.',
      );
    }
    const source = hasOriginalAppointment
      ? {
          date: appointmentTestData.reschedule.originalDate,
          time: appointmentTestData.reschedule.originalTime,
        }
      : {
          date: appointmentTestData.reschedule.newDate,
          time: appointmentTestData.reschedule.newTime,
        };
    const destination = hasOriginalAppointment
      ? {
          date: appointmentTestData.reschedule.newDate,
          time: appointmentTestData.reschedule.newTime,
        }
      : {
          date: appointmentTestData.reschedule.originalDate,
          time: appointmentTestData.reschedule.originalTime,
        };
    await appointmentsPage.reschedule(
      appointmentTestData.reschedule.specialist,
      source.date,
      source.time,
      destination.date,
      destination.time,
      SMOKE_RENDER_DELAY_MS,
    );
    await authenticatedDashboard.openAppointments(SMOKE_RENDER_DELAY_MS);
    await appointmentsPage.openUpcomingAppointments();
    await expect
      .poll(() =>
        appointmentsPage.hasUpcomingAppointment(
          appointmentTestData.reschedule.specialist,
          destination.date,
          destination.time,
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        appointmentsPage.hasUpcomingAppointment(
          appointmentTestData.reschedule.specialist,
          source.date,
          source.time,
        ),
      )
      .toBe(false);
  });

  test('TC-CANCEL-001 cancels the rescheduled specialist smoke appointment', async ({
    authenticatedDashboard,
    appointmentsPage,
    bookingPage,
  }) => {
    await authenticatedDashboard.openAppointments(SMOKE_RENDER_DELAY_MS);
    await appointmentsPage.openUpcomingAppointments();
    let hasRescheduledAppointment = await appointmentsPage.hasUpcomingAppointment(
      appointmentTestData.reschedule.specialist,
      appointmentTestData.reschedule.newDate,
      appointmentTestData.reschedule.newTime,
    );
    let hasOriginalAppointment = hasRescheduledAppointment
      ? false
      : await appointmentsPage.hasUpcomingAppointment(
        appointmentTestData.reschedule.specialist,
        appointmentTestData.reschedule.originalDate,
        appointmentTestData.reschedule.originalTime,
      );
    if (!hasRescheduledAppointment && !hasOriginalAppointment) {
      await bookSpecialistSmokeAppointment(
        appointmentsPage,
        bookingPage,
        appointmentTestData.reschedule.originalDate,
        appointmentTestData.reschedule.originalTime,
      );
      await authenticatedDashboard.openAppointments(SMOKE_RENDER_DELAY_MS);
      await appointmentsPage.openUpcomingAppointments();
      await expect
        .poll(
          () =>
            appointmentsPage.hasUpcomingAppointment(
              appointmentTestData.reschedule.specialist,
              appointmentTestData.reschedule.originalDate,
              appointmentTestData.reschedule.originalTime,
            ),
          { timeout: 30_000 },
        )
        .toBe(true);
      hasOriginalAppointment = true;
    }
    if (hasRescheduledAppointment === hasOriginalAppointment) {
      throw new Error(
        hasRescheduledAppointment
          ? 'Both original and rescheduled smoke appointments exist; resolve the duplicate QA data before cancellation.'
          : 'No specialist smoke appointment exists to cancel; run the specialist booking smoke case first.',
      );
    }
    const slot = hasRescheduledAppointment
      ? {
          date: appointmentTestData.reschedule.newDate,
          time: appointmentTestData.reschedule.newTime,
        }
      : {
          date: appointmentTestData.reschedule.originalDate,
          time: appointmentTestData.reschedule.originalTime,
        };
    await appointmentsPage.cancel(
      appointmentTestData.reschedule.specialist,
      slot.date,
      slot.time,
      SMOKE_RENDER_DELAY_MS,
    );
    await appointmentsPage.page.reload();
    await authenticatedDashboard.openAppointments(SMOKE_RENDER_DELAY_MS);
    await appointmentsPage.openUpcomingAppointments();
    await expect
      .poll(() =>
        appointmentsPage.hasUpcomingAppointment(
          appointmentTestData.reschedule.specialist,
          slot.date,
          slot.time,
        ),
      )
      .toBe(false);
  });
});
