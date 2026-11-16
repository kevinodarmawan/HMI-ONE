# HMI One UAT Exploration Report

Explored on 15 November 2026 using Playwright MCP and a local Playwright session for authenticated form inspection.

## Environment and connection

- Playwright MCP navigation, snapshots, clicks, and browser evaluation connected successfully.
- `BASE_URL`, `TEST_USER_EMAIL`, and `TEST_USER_PASSWORD` are configured in `.env`; secret values were not printed.
- Chromium login with the configured test account succeeded and opened the dashboard.
- The signed-in dashboard identifies the account as a QA rescheduling account. The appointment listing did not contain a Dr James Tan appointment at the time checked.

## Observed pages and navigation

| Page | Observed route | Relevant elements and behavior |
|---|---|---|
| Public dashboard | `/dashboard` | `Log In / Register`, `Consult a specialist`, `Book a screening` |
| Sign in | `/login` (in-app navigation) | `Email *`, `Enter your Password`, `Login`, `Forgot your password?` |
| Password reset | `/reset-password` | `Email *`, `Send Password Reset Email`; submitting sends an email and was not performed |
| Signed-in dashboard | `/dashboard` | `Browse Specialists`, `Browse Packages`, `Appointments`; greeting confirms successful login |
| Specialist listing | `/appointments/listing` | `Specialists` and `Health Screening` tabs; 8 doctors were listed, including Dr Shirley Bang and Dr James Tan |
| Screening listing | `/appointments/listing` with screening tab | 5 packages were listed, including Urology Wellness Screening (Men) |
| Specialist booking | `/appointments/make/` | Select a date and time from the calendar, then continue to personal-details/consent form |
| Screening booking | `/appointments/screening/` | Select package, select specialist, then date/time and personal details |
| Signed-in appointments | `/appointments` | Upcoming, Make An Appointment, and Past Appointments sections |

## Locator and workflow observations

- Use role/name or label locators for the sign-in form and tabs.
- The specialist listing exposes doctor names as plain text and a `Make Appointment` button in each card; cards do not expose a semantic heading.
- Screening cards expose a heading and a `Book Now` button.
- Date options expose `role=option` and accessible labels such as “Choose Friday, November 20th, 2026”.
- The calendar exposes the requested date as an accessible option and the available times as radios. After choosing a date and time, the last `Next` button advances to personal details.
- The authenticated booking form prefilled required personal fields for the QA account; it exposes two required checkboxes and `Submit`.
- The reset form’s button is “Send Password Reset Email”, not “Processing” as stated in the manual case.
- Dashboard wording differs between public and authenticated states: public users see “Consult a specialist”/“Book a screening”; signed-in users see “Browse Specialists”/“Browse Packages”.

## Automation risks and unresolved observations

- Direct navigation to `/login/` returned HTTP 404. Opening the public dashboard and clicking `Log In / Register` reliably reached `/login`.
- Direct navigation to the trailing-slash listing route also returned 404; in-app navigation loaded the listing successfully.
- The test cases request fixed dates and times. Dr James Tan's original 22 November 2026 setup date was marked unavailable. The user approved 28 November 2026 at 10:00 AM as the replacement; that date/time was verified available without submitting.
- The requested Dr Shirley Bang slot (20 November 2026, 10:00 AM) and Urology Wellness Screening slot with Dr Ronny Tan (21 November 2026, 09:00 AM) were selectable and reached the personal-details screen without submitting.
- Password reset has an external email side effect. Its automated test is opt-in.
- Booking, rescheduling, and cancellation change appointment data. Their tests are opt-in and should run only against the dedicated QA account.
- Appointment details/reschedule/cancellation were not exercised because no matching appointment was present and creating one would change UAT scheduling data.
- A browser console error was observed repeatedly: a Permissions Policy violation for `unload`; it did not prevent the observed navigation or login flow.

## Test case mapping

| Test case ID | Automation | Notes |
|---|---|---|
| `TC-LOGIN-001-SMOKE` | Login form and dashboard assertion | Uses configured credentials |
| `TC-FORGOTPWD-001-SMOKE` | Reset page and confirmation assertion | Opt-in; sends email |
| `TC-DASHBOARD-001-SMOKE` | Browse specialists and assert list | Read-only |
| `TC-DASHBOARD-002-SMOKE` | Browse packages and assert screening list | Read-only |
| `TC-APPOINTMENTS-001-SMOKE` | Specialist booking | Opt-in; 20 November 2026, 10:00 AM |
| `TC-APPOINTMENTS-002-SMOKE` | Screening booking | Opt-in; 21 November 2026, 09:00 AM |
| `TC-RESCHEDULE-001-SMOKE` | Creates then reschedules Dr James Tan appointment | Opt-in; uses user-approved 28 November setup slot |
| `TC-CANCEL-001` | Creates then cancels Dr James Tan appointment | Original ID preserved; uses user-approved 28 November setup slot |
