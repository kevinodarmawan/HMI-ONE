export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const runPasswordResetTest = process.env.RUN_PASSWORD_RESET_TEST === 'true';
export const runMutatingAppointmentTests =
  process.env.RUN_MUTATING_APPOINTMENT_TESTS === 'true';
