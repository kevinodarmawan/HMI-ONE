# HMI One Smoke Test Execution Report

The full-suite 31-test passing baseline from 16 November 2026 is recorded in
[test-baseline.md](./test-baseline.md).

## Latest run before skip correction (16 November 2026)

`npm run test:smoke` completed in 4.8 minutes with a 10-second pause after each confirmed
smoke page/workflow-step transition. Six cases passed, none failed, and two were skipped because
the required Dr James Tan appointment fixture was not present. The specialist and screening
booking cases completed successfully. The password-reset case also ran and requested an email.
Review UAT appointments before another mutating run.

## Reschedule and cancellation skip correction

The reschedule and cancellation smoke cases previously skipped when their pre-provisioned
Dr James Tan appointment was absent. They now use the specialist smoke appointment when present
and create it through the UI when missing. Reschedule checks both configured slot states, performs
a transition in either direction so reruns still exercise the workflow, and verifies the resulting
Upcoming appointment state. Cancellation creates a fixture if needed and verifies that the
appointment is no longer in Upcoming. Booking failures, duplicate fixture state, and slot conflicts
fail visibly instead of skipping. These state-changing tests remain behind
`RUN_MUTATING_APPOINTMENT_TESTS=true`.
Targeted validation after this change ran `TC-RESCHEDULE-001-SMOKE` and `TC-CANCEL-001`: both
passed with no skips in 4.2 minutes. The test created its appointment fixture through the UI,
rescheduled it, then canceled it; cancellation was verified after reloading the appointment list.
The full smoke suite was not rerun.

| Total | Passed | Failed | Skipped | Duration |
|---:|---:|---:|---:|---:|
| 8 | 6 | 0 | 2 | 4.8 min |

## Previous user-reported appointment failures

An earlier rerun reported `TC-APPOINTMENTS-001-SMOKE` and `TC-RESCHEDULE-001-SMOKE` failing.
The specialist booking was explicitly rejected because the selected slot conflicts with an
upcoming appointment. The reschedule case failed before reaching the reschedule flow: its
automatic setup booking received HTTP 400 and the application's generic error page.

At that point, the reschedule test required the original Dr James Tan appointment to be
pre-provisioned instead of creating it implicitly. The full smoke run skipped the reschedule case
because that fixture was absent. The earlier HTTP 400 remains an application-side rejection; do not
treat it as a successful reschedule.

## Earlier smoke rerun (15 November 2026)

`npm run test:smoke` ran all 8 cases with both configured opt-in flags enabled: 6 passed and 2
failed. `TC-APPOINTMENTS-001-SMOKE` and `TC-APPOINTMENTS-002-SMOKE` reached Submit, then the
application displayed its generic error page. Both booking requests returned HTTP 400 from
`POST /la/hmi`; the response did not match the test's known conflict, validation, or session
error categories. This is an application/API rejection, not a Playwright locator or timeout
failure.

The configured password-reset case sent an email. The mutating appointment cases were also
enabled; the reschedule and cancellation cases completed. A read-only post-run check found no
Upcoming appointment cards or matches for the configured smoke slots. Do not repeat mutating
cases until the QA account state is reviewed.

The required personal-detail fields were populated when the form appeared, so an empty required
field is not supported as the cause. The workspace contains no backend implementation or API
logs, and the response was intentionally reduced to a sanitized category; the specific HTTP 400
reason cannot be established from this run. Do not change the test to treat HTTP 400 as success
or skip it. Resolve with the backend/API error code or server-side log for the failed request.

Executed on 15 November 2026 against the configured UAT base URL using Chromium and the test account configured in `.env`.

## Summary

| Total | Passed | Failed | Skipped |
|---:|---:|---:|---:|
| 8 | 4 | 4 | 0 |

## Results

| Test case ID | Status | Result |
|---|---|---|
| `TC-LOGIN-001-SMOKE` | Passed | Login reached the dashboard. |
| `TC-FORGOTPWD-001-SMOKE` | Passed | The reset confirmation appeared. A reset email was requested. |
| `TC-DASHBOARD-001-SMOKE` | Passed | The specialist listing loaded. |
| `TC-DASHBOARD-002-SMOKE` | Passed | The screening package listing loaded. |
| `TC-APPOINTMENTS-001-SMOKE` | Failed | Submit led to “We are sorry, something went wrong. Please try again.” |
| `TC-APPOINTMENTS-002-SMOKE` | Failed | Submit led to the same application error page. |
| `TC-RESCHEDULE-001-SMOKE` | Failed | Its setup booking led to the application error page; rescheduling was not reached. |
| `TC-CANCEL-001` | Failed | Its setup booking led to the application error page; cancellation was not reached. |

## Failure classification and follow-up

All four appointment failures occurred after submitting the booking form. The observed response was the application's generic error page, not a Playwright locator or navigation failure. Available UI evidence does not distinguish an application defect from a backend/API dependency failure; server-side logs are needed to classify it conclusively.

The appointment list subsequently showed Dr James Tan where the pre-run check had shown no matching appointment. A submission may have created UAT data despite the error page. The failed appointment tests were not repeated, and no records were cancelled or otherwise changed during follow-up.

The HTML report is generated at `playwright-report/index.html`. Browser-based tests attach videos
from `test-results/`; inspect them for account or appointment details before sharing the report.
Screenshots and traces remain disabled.

## Follow-up transition validation

The booking page objects now select the exact test-case dates/times, wait for the doctor/package selection, date/time step, personal-details summary, required consent checks, and enabled Submit button. Submission waits up to 30 seconds for either the expected success confirmation or the known generic application error, which is reported as a failure rather than a timeout. The original Dr James Tan setup date, 22 November 2026, was marked unavailable; the user approved 28 November 2026 at 10:00 AM as a replacement, and that slot was verified without submitting.

After the exact-date picker changes, Dr Shirley Bang's 20 November 10:00 AM slot and the screening 21 November 09:00 AM slot were selected and verified on the personal-details screen without submitting. The screening summary renders 09:00 as 9:00 AM; the summary assertion now accepts that display normalization. Dr James Tan's replacement 28 November 10:00 AM setup slot was verified available without submitting. The latest safe Playwright run passed the 3 read-only cases and skipped the 5 side-effect cases. The four appointment submissions were not retried because the earlier attempts may have created UAT records.

## Latest headed run follow-up

The headed run reported two booking submissions ending on the application's generic error page, one Dr James Tan setup blocked because 22 November is unavailable, and one setup where the manual calendar was still collapsed. The picker now opens `Or Select Date & Time` when needed and waits up to 30 seconds for the calendar. This transition and the user-approved 28 November setup slot were verified without submitting. The two generic application errors remain unresolved by test-side waiting; they require application/backend investigation, and those submissions were not repeated to avoid creating duplicate UAT records.

## Latest targeted rerun

The health-screening navigation test now passes after allowing the asynchronously loaded package list more time. Appointment-list navigation now waits for the dashboard appointment response, and card matching is scoped to the appointment-card wrapper so responsive “Details” links are not mistaken for duplicate appointments. Cancellation is skipped when its required Dr James Tan appointment is absent.

| Test case ID | Earlier status | Result |
|---|---|---|
| `TC-DASHBOARD-002-SMOKE` | Passed | The health-screening list loaded. |
| `TC-APPOINTMENTS-001-SMOKE` | Failed | The UAT application displayed its generic error page after Submit. This is not a locator timeout and remains an application/backend issue. |
| `TC-RESCHEDULE-001-SMOKE` | Failed | The required Dr James Tan setup appointment did not appear in Upcoming Appointments. An earlier setup attempt was also rejected by the application because the selected slot conflicted with an existing appointment. |
| `TC-CANCEL-001` | Passed | Cancellation completed in the targeted rerun. |

The reschedule dialog uses different heading and summary wording from the booking flow; the date/time picker now recognizes those labels. The successful selection and reschedule submission still need verification after a conflict-free setup appointment is available. Mutating reruns changed the QA account's appointment state; review Upcoming and Past Appointments before another mutating run.

An earlier `TC-RESCHEDULE-001-SMOKE` rerun could not reach the reschedule dialog because creating its missing setup appointment led to the application's generic error page. Later runs reached the dialog and confirmed that the manual-calendar action is the second `Next` button.

## Latest headed validation (15 November 2026)

The targeted headed run completed with both `TC-LOGIN-001-SMOKE` and `TC-RESCHEDULE-001-SMOKE` passing. Login now allows up to 30 seconds for the UAT page to leave its `Processing` state. Reschedule appointment matching accepts the UI's unpadded `9:00 AM` display and returns early when the requested rescheduled appointment already exists, avoiding a duplicate mutation. The picker validates the requested date/time in the review summary; if UAT rejects the slot as occupied, the test reports a skip with the conflict reason rather than timing out. Type checking reported no errors in the changed files.

## Latest specialist booking transition validation

Removed fixed 10-second sleeps between specialist selection, date/time selection, consent checks, and submission. The flow advances on rendered headings, selected-slot state, checked consents, and an enabled Submit button; after submission, it waits for the application's success or rejection state. One headed rerun reached Submit, displayed the generic error page, and received HTTP 400 from `POST /la/hmi`; a subsequent targeted rerun passed. This makes the failure intermittent and confirms that extra render waits alone do not explain it. On a future generic error, the test reports a sanitized category from the API error response without printing its payload. Review UAT appointments before retrying because a failed-looking submission may still affect account data.

## Full headed suite rerun (15 November 2026)

`npx playwright test --headed` ran all 8 cases: 6 passed and 2 failed. `TC-APPOINTMENTS-001-SMOKE` reached the generic error page after Submit; the booking API returned HTTP 400 with no recognizable conflict or validation category. `TC-RESCHEDULE-001-SMOKE` also reached the generic application error page after submitting. The other 6 cases passed. The UI transitions completed before both failures, so additional fixed waits are not a fix; UAT/API logs are required to identify the rejected requests. Check the QA account state before rerunning because the suite includes appointment mutations.

The specialist and screening booking flows now include the requested 10-second pauses after page/content transitions, specialist selection, personal-details rendering, and Submit. Date/time selection itself still uses the selected-date/time assertions. Type checking is clean; the mutating UAT flows were not rerun after adding these delays.
