# HMI One Playwright Automation

Playwright TypeScript smoke and functional tests for the HMI One UAT workflows.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `BASE_URL`, `TEST_USER_EMAIL`, and `TEST_USER_PASSWORD` in `.env`.
4. Install Chromium with `npx playwright install chromium`.

Credentials are read from environment variables and are not written to reports or test source.
Videos are recorded for browser-based tests and linked from the HTML report. Videos can show
visible account or appointment details; keep `test-results/` and `playwright-report/` restricted
and do not share them without review. Screenshots and traces remain disabled.

## Run

- `npm test` runs the suite in Chromium, saves test videos under `test-results/`, and writes the
  HTML report with video attachments to `playwright-report`.
- `npm run test:smoke` selects tests tagged `@smoke`.
- `npm run test:functional` runs the read-only functional suite in `tests/functional/`.
- `npm run test:functional:appointments` runs appointment-related functional tests.
- `npm run test:functional:auth` runs authentication and registration tests.
- `npm run test:functional:content` runs informational and policy-page tests.
- `npm run test:functional:contact` runs Contact Us tests.
- `npm run test:unit` runs isolated utility tests.
- `npm run test:case -- TC-LOGIN-001` runs a specific test case by ID.
- `npx playwright show-report` opens the latest HTML report.
- [Test execution baseline](./docs/test-baseline.md) records the verified 31-test passing run.

Functional tests are grouped by feature in the Playwright report and carry stable case IDs
for targeted runs. Appointment tests are tagged `@appointments`; authentication tests use
`@auth`. Test order is deterministic, but cases are designed to run independently.

Password reset sends an email and is opt-in. Set `RUN_PASSWORD_RESET_TEST=true` only when using a controlled mailbox.

Appointment creation, rescheduling, and cancellation change UAT data. They are opt-in via
`RUN_MUTATING_APPOINTMENT_TESTS=true` and should only be enabled for the dedicated QA account.
In the smoke run, the specialist booking case supplies the appointment used by the following
reschedule and cancellation cases; either case also creates that fixture through the UI when it is
absent. They no longer skip for missing data, and a booking or reschedule conflict is reported as a
failure. The smoke workflows run sequentially so appointment state can be checked after each change.
Smoke tests wait for the destination page's key content or the required API response before
continuing, then wait 10 seconds after each confirmed page or wizard-step transition so the
application can finish rendering. Functional tests do not use these fixed pauses. Mutating
appointment workflows have a three-minute timeout and run serially to reduce slot conflicts.
They select the exact dates and times in
`smoke-testcases.md`, open the manual calendar when needed, and wait for the requested date/time and
final application state. Before submission, they check the selected specialist, date/time summary,
consent states, and Submit availability; after submission they wait up to 30 seconds for the expected
success state or report the application's generic error state.

## Project layout

- `pages/`: page objects and reusable UI actions.
- `fixtures/`: Playwright fixtures, including the authenticated dashboard.
- `test-data/`: named test data.
- `tests/smoke/`: test specifications mapped to the original case IDs.
- `tests/functional/`: read-only functional workflow tests grouped by feature.
- `tests/unit/`: isolated tests for shared helpers.
- `config/`: required environment configuration.
- `utils/`: shared appointment date and submission helpers.
- `docs/exploration-report.md`: observed application routes, controls, and limitations.
- `docs/functional-testcases.md`: positive and negative functional test case inventory and automation status.
