import { test, expect } from '@playwright/test';
import {
  formatAppointmentCardDate,
  formatAppointmentSummaryDate,
  formatCalendarDateLabel,
  parseAppointmentDate,
} from '../../utils/appointmentDate';

test.describe('Appointment date utilities @unit', () => {
  test('formats a valid appointment date for the calendar and appointment summary', () => {
    const date = parseAppointmentDate('2026-11-21');

    expect(formatCalendarDateLabel(date)).toBe('Saturday, November 21st, 2026');
    expect(formatAppointmentSummaryDate(date)).toBe('21 Nov 2026');
    expect(formatAppointmentCardDate('2026-11-21')).toBe('21 Nov 2026');
  });

  test('rejects malformed and impossible appointment dates', () => {
    expect(() => parseAppointmentDate('2026-2-21')).toThrow(/YYYY-MM-DD/);
    expect(() => parseAppointmentDate('2026-02-29')).toThrow(/Invalid appointment date/);
  });
});
