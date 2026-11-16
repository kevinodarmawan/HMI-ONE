# Playwright Test Baseline

Dokumen ini mencatat baseline lulus yang dapat dipakai untuk membandingkan eksekusi berikutnya.
Baseline ini merekam hasil run, bukan jaminan bahwa aplikasi atau UAT akan selalu stabil.

## Run yang tercatat

| Item | Nilai |
|---|---|
| Tanggal | 16 November 2026 |
| Perkiraan waktu | 10:06 WIB, berdasarkan waktu pembuatan HTML report |
| Perintah | `npm test` (`playwright test`) |
| Browser | Chromium |
| Worker | 1 |
| Hasil | **31 passed, 0 failed, 0 skipped** |
| Durasi total | 8.5 menit |
| File paling lambat | `tests/smoke/hmi-smoke.spec.ts`, 7.0 menit |
| Versi `@playwright/test` | 1.65.1 |

Angka hasil dan durasi di atas berasal dari output terminal run. Playwright juga menyimpan
`test-results/.last-run.json` dengan `status: passed` dan `failedTests: []`.

## Cakupan test pada baseline

Output `npx playwright test --list` mencatat 31 test dalam enam file. Karena run melaporkan
31 passed tanpa failure atau skip, seluruh test berikut termasuk dalam hasil lulus tersebut.

| File | Jumlah | Test ID / cakupan |
|---|---:|---|
| `tests/functional/booking-flow.spec.ts` | 3 | `FT-BOOK-P01`, `FT-BOOK-P03`, `FT-BOOK-N01` |
| `tests/functional/form-validation.spec.ts` | 4 | `FT-AUTH-N01`, `FT-REG-N01`, `FT-PWD-N01`, `FT-CONTACT-N01` |
| `tests/functional/information-pages.spec.ts` | 6 | `FT-ABOUT-P01`, `FT-FAQ-P01`, `FT-FAQ-N01`, `FT-CONTACT-P01`, `FT-LEGAL-P01`, `FT-MEDDOC-N01` |
| `tests/functional/navigation.spec.ts` | 8 | `FT-AUTH-P01`, `FT-DASH-P01`, `FT-DASH-P02`, `FT-DASH-P03`, `FT-SPEC-P03`, `FT-SCR-P01`, `FT-SCR-N01`, `FT-MEDDOC-P01` |
| `tests/smoke/hmi-smoke.spec.ts` | 8 | `TC-LOGIN-001-SMOKE`, `TC-FORGOTPWD-001-SMOKE`, `TC-DASHBOARD-001-SMOKE`, `TC-DASHBOARD-002-SMOKE`, `TC-APPOINTMENTS-001-SMOKE`, `TC-APPOINTMENTS-002-SMOKE`, `TC-RESCHEDULE-001-SMOKE`, `TC-CANCEL-001` |
| `tests/unit/appointment-date.spec.ts` | 2 | Calendar/summary date formatting; malformed and impossible date rejection |
| **Total** | **31** | **31 passed** |

## Report dan bukti lokal

- HTML report: [`playwright-report/index.html`](../playwright-report/index.html)
- Status terakhir Playwright: [`test-results/.last-run.json`](../test-results/.last-run.json)
- Test listing: jalankan `npx playwright test --list`
- Fingerprint SHA-256 HTML report saat baseline dibuat:
  `DEB2C2E7FD33150F4F068D8FCC6324B9389BE1A31BE0262BCE1445C02EBF5AA8`

HTML report dibuat sekitar 10:06:25 WIB pada tanggal tersebut dan memuat video untuk test browser.
Folder report dan hasil Playwright ditimpa oleh run berikutnya; hash di atas dapat digunakan untuk
memeriksa apakah file HTML yang ada masih report baseline. Dokumen ini mempertahankan ringkasan
hasil dan daftar test jika artefak report sudah tergantikan.

Video dan report mungkin menampilkan detail akun atau appointment. Batasi akses dan tinjau isinya
sebelum dibagikan.

## Cara membandingkan jika run berikutnya gagal

1. Catat command, tanggal/waktu, jumlah passed/failed/skipped, dan nama test yang gagal.
2. Bandingkan test ID dan cakupan dengan tabel baseline di atas; gunakan ID untuk menjalankan kasus
   terarah, misalnya `npm run test:case -- TC-RESCHEDULE-001-SMOKE`.
3. Periksa error dan video pada HTML report terbaru. Jangan menyalin credentials, data pribadi,
   atau response API mentah ke log/dokumen.
4. Tentukan apakah perbedaannya berasal dari aplikasi/UAT, fixture atau state akun, environment,
   atau perubahan test sebelum mengubah assertion.
5. Test appointment dan reset password dapat berdampak nyata. Sebelum mengulang kasus mutating,
   periksa state akun QA dan flag opt-in; hindari menjalankan seluruh suite berulang tanpa alasan.

Perubahan pada kode test, data, browser, konfigurasi, atau environment membuat hasil berikutnya
tidak identik dengan baseline dan perlu dicatat bersama hasilnya.
