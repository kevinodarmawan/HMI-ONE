# HMI One Smoke Test Cases (UAT)

**Base URL:** https://aua-uat.d2qee8e2q1r7bj.amplifyapp.com/login/

**Test data:** Credentials are masked. Use `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` from your `.env` file instead of writing them in documents or code.

## Summary

| ID | Title | Depends On |
|---|---|---|
| TC-LOGIN-001-SMOKE | User login with valid email and password | - |
| TC-FORGOTPWD-001-SMOKE | User can reset their password | - |
| TC-DASHBOARD-001-SMOKE | User can go to "Consult to specialist" | Login |
| TC-DASHBOARD-002-SMOKE | User can go to "Book a screening" via "Explore our service" | Login |
| TC-APPOINTMENTS-001-SMOKE | User can create a specialist appointment | Login |
| TC-APPOINTMENTS-002-SMOKE | User can create a screening appointment | Login |
| TC-RESCHEDULE-001-SMOKE | User can reschedule the appointment | Login, Dr James Tan appointment |
| TC-CANCEL-001 | User can cancel the appointment | Login, Dr James Tan appointment (from TC-RESCHEDULE-001-SMOKE) |

---

## TC-LOGIN-001-SMOKE: User login with valid email and password

**Preconditions**
1. Go to https://aua-uat.d2qee8e2q1r7bj.amplifyapp.com/login/

**Steps**
1. User inputs a valid email in the email field.
2. User inputs a valid password in the password field.
3. Click the Login button.

**Test Data**
- Email: `TEST_USER_EMAIL`
- Password: `TEST_USER_PASSWORD`

**Expected Result**
- User is redirected to the HMI One Dashboard.

---

## TC-FORGOTPWD-001-SMOKE: User can reset their password

**Preconditions**
1. Go to https://aua-uat.d2qee8e2q1r7bj.amplifyapp.com/login/

**Steps**
1. Click the "Forgot your password" button.
2. Input a valid email.
3. Click the "Processing" button.

**Test Data**
- Email: `TEST_USER_EMAIL`

**Expected Result**
- The message "Reset password email sent" is displayed.

---

## TC-DASHBOARD-001-SMOKE: User can go to "Consult to specialist"

**Preconditions**
1. User is logged in with valid credentials.

**Steps**
1. Go to the Dashboard.
2. Click "Consult to specialist".

**Test Data**
- Email: `TEST_USER_EMAIL`
- Password: `TEST_USER_PASSWORD`

**Expected Result**
- User is taken to the specialist page and sees a list of specialists.

---

## TC-DASHBOARD-002-SMOKE: User can go to "Book a screening" via "Explore our service"

**Preconditions**
1. User is logged in with valid credentials.

**Steps**
1. Go to the Dashboard.
2. Click "Book a screening".

**Test Data**
- Email: `TEST_USER_EMAIL`
- Password: `TEST_USER_PASSWORD`

**Expected Result**
- User is taken to the health screening page and sees a list of health screenings.

---

## TC-APPOINTMENTS-001-SMOKE: User can create a specialist appointment

**Preconditions**
1. User is logged in with valid credentials.

**Steps**
1. Click the hamburger button in the top right corner.
2. Click "Appointment".
3. Click "Make an appointment".
4. Choose Dr. Shirley Bang as the doctor and click "Make appointment".
5. Select date: 20 November 2026.
6. Select time: 10:00 AM.
7. Click the blue "Next" button.
8. Check "By using HMI One, I have read and accept the Terms of Use (Required)".
9. Check "I consent to my personal data, including my sensitive personal data, being processed in accordance with the relevant Privacy Notices of Singapore (Required)".
10. Click "Submit".

**Test Data**
- Email: `TEST_USER_EMAIL`
- Password: `TEST_USER_PASSWORD`
- Doctor: Dr. Shirley Bang
- Date and time: 20 November 2026, 10:00 AM

**Expected Result**
- The appointment is created and "Appointment confirmed" is displayed.

---

## TC-APPOINTMENTS-002-SMOKE: User can create a screening appointment

**Preconditions**
1. User is logged in with valid credentials.

**Steps**
1. Click the hamburger button in the top right corner.
2. Click "Appointment".
3. Click "Make an appointment".
4. Click "Health Screening".
5. Choose "Urology Wellness Screening (Men)" and click "Book Now".
6. Choose "Dr Ronny Tan" and click "Next".
7. Select date: 21 November 2026.
8. Select time: 09:00 AM.
9. Click the blue "Next" button at the bottom.
10. Check "By using HMI One, I have read and accept the Terms of Use (Required)".
11. Check "I consent to my personal data, including my sensitive personal data, being processed in accordance with the relevant Privacy Notices of Singapore (Required)".
12. Click "Submit".

**Test Data**
- Email: `TEST_USER_EMAIL`
- Password: `TEST_USER_PASSWORD`
- Package: Urology Wellness Screening (Men)
- Doctor: Dr Ronny Tan
- Date and time: 21 November 2026, 09:00 AM

**Expected Result**
- The appointment is created and "Appointment confirmed" is displayed.

---

## TC-RESCHEDULE-001-SMOKE: User can reschedule the appointment

**Preconditions**
1. User is logged in with valid credentials.
2. An upcoming appointment with Dr James Tan exists. If not, create one:
   1. Click the hamburger button in the top right corner.
   2. Click "Appointment".
   3. Click "Make an appointment".
   4. Choose Dr James Tan as the doctor and click "Make appointment".
   5. Select date: 28 November 2026.
   6. Select time: 10:00 AM.
   7. Click the blue "Next" button.
   8. Check the Terms of Use checkbox (Required).
   9. Check the Privacy Notice consent checkbox (Required).
   10. Click "Submit".

**Steps**
1. Go to the Appointment feature.
2. In Upcoming Appointment, choose Dr. James Tan and click "Details".
3. Click the "Reschedule" button.
4. Select date: 24 November 2026.
5. Select time: 09:00 AM.
6. Click the blue "Next" button.
7. Click "Submit".

**Test Data**
- Email: `TEST_USER_EMAIL`
- Password: `TEST_USER_PASSWORD`
- Original slot: 28 November 2026, 10:00 AM
- New slot: 24 November 2026, 09:00 AM

**Expected Result**
- The appointment is rescheduled successfully.

---

## TC-CANCEL-001: User can cancel the appointment

**Preconditions**
1. User is logged in with valid credentials.
2. User goes to the Appointments feature, Upcoming Appointment.
3. An upcoming appointment with Dr. James Tan exists (for example, the one from TC-RESCHEDULE-001-SMOKE).

**Steps**
1. In Upcoming Appointment, choose Dr. James Tan and click "Details".
2. Click the "Cancel Appointment" button.
3. Click "Yes, Cancel my appointment".

**Test Data**
- Email: `TEST_USER_EMAIL`
- Password: `TEST_USER_PASSWORD`

**Expected Result**
- The appointment is cancelled and "Your appointment has been cancelled" is displayed.

---

## Notes for the QA team

- **TC-RESCHEDULE-001-SMOKE source data:** In the original, the columns were shifted. The appointment creation steps were in Preconditions, the reschedule steps were in Test Data, and Expected was empty. I restructured it so creation is a precondition, reschedule is the steps, and the expected result is filled in.
- **Typos fixed:** "09:AM" became "09:00 AM", and "lcik" became "click".
- **TC-CANCEL-001** has no `-SMOKE` suffix in the original ID. Please confirm whether it should be `TC-CANCEL-001-SMOKE`.
- **Hardcoded dates:** The appointments use fixed dates. Update the test-case dates when they are no longer in the future or when the calendar marks a slot unavailable.
- **Repeated runs:** Booking the same doctor and slot again may be rejected as already taken. Use a different slot per run, or cancel the test-created appointment during cleanup.
- **Selecting the right appointment:** Choosing "Dr. James Tan" in Upcoming Appointment may match more than one row if earlier runs left data behind. Cleanup of test-created appointments is recommended.
- **TC-FORGOTPWD-001-SMOKE** sends a real email and may change account state. Run it only with a controlled mailbox.
- **Step wording:** "Processing" in TC-FORGOTPWD-001-SMOKE is probably a submit button label. Please verify.