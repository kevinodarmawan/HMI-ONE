# HMI One Functional Test Cases

Dokumen ini mencatat positive dan negative functional test cases yang dapat diotomatisasi untuk alur HMI One yang teramati.

Versi CSV untuk spreadsheet: [functional-testcases.csv](./functional-testcases.csv).

## Status automation

Test read-only berikut sudah diimplementasikan di `tests/functional/`:

- `FT-AUTH-P01`
- `FT-AUTH-N01`
- `FT-REG-N01`
- `FT-PWD-N01`
- `FT-DASH-P01`, `FT-DASH-P02`, `FT-DASH-P03`
- `FT-SPEC-P03`
- `FT-SCR-P01`, `FT-SCR-N01`
- `FT-BOOK-N01`, `FT-BOOK-P01`
- `FT-MEDDOC-P01`
- `FT-ABOUT-P01`
- `FT-FAQ-P01`, `FT-FAQ-N01`
- `FT-CONTACT-P01`, `FT-CONTACT-N01`
- `FT-LEGAL-P01`
- `FT-MEDDOC-N01`

Jalankan dengan `npm run test:functional`. Negative test untuk form kosong/malformed memblokir semua POST dari browser, memeriksa validasi UI, dan memastikan tidak ada request yang dikirim ke server.

Registrasi valid, reset password valid, submit booking, reschedule, dan cancel belum dimasukkan ke suite functional default karena memerlukan data QA atau berdampak nyata. Case tersebut tetap dicatat di bawah untuk pelaksanaan terkontrol setelah prasyaratnya tersedia.

## Status dan batasan eksplorasi

- **Terkonfirmasi** berarti alur atau kontrolnya teramati, atau test read-only terkait sudah lulus.
- **Perlu validasi** berarti expected result adalah perilaku yang diharapkan, tetapi belum diuji pada aplikasi. Jangan mengunci pesan error atau selector tertentu sebelum hasil UI diverifikasi.
- Eksplorasi dilakukan tanpa mengirim form registrasi/reset password dan tanpa membuat, mengubah, atau membatalkan appointment.
- Saat eksplorasi, tidak ada appointment pada daftar akun QA. Detail, reschedule, dan cancel memerlukan data appointment QA yang disiapkan.
- Submit booking pernah menampilkan error aplikasi pada eksekusi sebelumnya; dampak terhadap data tidak selalu jelas. Jangan mengulang submit tanpa memeriksa state akun QA.
- Hindari mencetak kredensial, data pribadi, atau payload API ke log dan report.

## Pengamanan eksekusi

1. Gunakan hanya environment UAT/QA dan kredensial dari environment variables; jangan menaruh credentials di source test atau report.
2. Pisahkan test read-only dari test yang mengubah state.
3. Reset password memakai mailbox terkendali. Registrasi memakai alamat QA unik.
4. Booking, reschedule, dan cancel hanya dijalankan dengan akun serta appointment QA khusus, dan dengan pemeriksaan state sebelum dan sesudah test.
5. Test `@smoke` yang sudah ada juga mencakup alur ber-side-effect. Periksa flag opt-in sebelum menjalankannya; jangan menganggap `test:smoke` selalu read-only.
6. Tanggal dan slot pada test data dapat kedaluwarsa atau sudah terisi. Pilih slot yang tersedia melalui UI dan verifikasi sebelum submit.

## Authentication

### FT-AUTH-P01 — Login dengan kredensial valid

- **Jenis:** Positive; read-only setelah login.
- **Prasyarat:** Kredensial akun QA valid tersedia melalui environment variables.
- **Langkah:** Buka halaman awal, pilih **Log In / Register**, isi email dan password valid, lalu pilih **Login**.
- **Hasil yang diharapkan:** Pengguna masuk ke dashboard dan greeting dashboard tampil.
- **Status:** Terkonfirmasi; test yang ada lulus.

### FT-AUTH-N01 — Login dengan field kosong

- **Jenis:** Negative; perlu validasi.
- **Langkah:** Buka form login dan coba lanjutkan tanpa email dan password.
- **Hasil yang diharapkan:** Pengguna tidak masuk ke dashboard dan menerima validasi yang dapat dipahami.
- **Catatan:** Input yang diamati tidak memiliki atribut HTML `required`. Perilaku setelah submit belum diuji; verifikasi bahwa tidak ada login sukses sebelum menetapkan assertion UI/API yang lebih spesifik.

### FT-AUTH-N02 — Login dengan kredensial tidak valid

- **Jenis:** Negative; perlu akun khusus.
- **Prasyarat:** Gunakan akun negatif khusus atau kredensial yang tidak dapat mengunci akun QA utama.
- **Langkah:** Coba login dengan kredensial tidak valid.
- **Hasil yang diharapkan:** Pengguna tidak masuk ke dashboard dan aplikasi menampilkan penolakan login.
- **Catatan:** Pesan error aktual belum diverifikasi. Hindari pengulangan yang dapat memicu rate limit atau account lockout.

## Registrasi

### FT-REG-P01 — Registrasi dengan data QA valid

- **Jenis:** Positive; mengubah state dan mungkin mengirim email.
- **Prasyarat:** Alamat email QA unik dan proses verifikasi akun dapat diakses.
- **Langkah:** Isi field registrasi dengan data QA valid, lengkapi persetujuan yang diperlukan, lalu pilih **Register**.
- **Hasil yang diharapkan:** Registrasi diterima dan aplikasi menampilkan langkah/konfirmasi berikutnya.
- **Status:** Belum diuji. Teks konfirmasi dan apakah verifikasi email/OTP diperlukan harus dicatat saat eksplorasi terkontrol.

### FT-REG-N01 — Registrasi dengan data atau persetujuan tidak lengkap

- **Jenis:** Negative; berpotensi mengirim request.
- **Langkah:** Pada environment QA, coba registrasi dengan field wajib kosong atau persetujuan wajib tidak dicentang.
- **Hasil yang diharapkan:** Akun tidak dibuat dan pengguna mendapat validasi.
- **Catatan:** Form kosong yang diamati lolos `checkValidity()` browser; tombol **Register** juga aktif. Jangan submit di UAT biasa sebelum tersedia alamat dan prosedur pembersihan akun QA.

## Password reset

### FT-PWD-P01 — Meminta reset password untuk mailbox terkendali

- **Jenis:** Positive; mengirim email.
- **Prasyarat:** Mailbox QA terkendali.
- **Langkah:** Buka **Forgot your password?**, isi email QA yang valid, lalu pilih **Send Password Reset Email**.
- **Hasil yang diharapkan:** Pesan **Reset password email sent** tampil.
- **Status:** Case sudah ada di smoke suite; eksekusi mengirim email sungguhan dan harus tetap opt-in.

### FT-PWD-N01 — Meminta reset dengan input kosong atau format tidak valid

- **Jenis:** Negative; perlu validasi.
- **Langkah:** Periksa validasi untuk input kosong dan alamat berformat tidak valid tanpa menggunakan mailbox pengguna sungguhan.
- **Hasil yang diharapkan:** Permintaan reset ditolak dan tidak ada email reset yang dikirim.
- **Status:** Diotomatisasi; test memblokir POST sebelum mencoba submit.

## About Us

### FT-ABOUT-P01 — Menampilkan informasi HMI One

- **Jenis:** Positive; read-only.
- **Langkah:** Pilih **About HMI One** dari navigasi.
- **Hasil yang diharapkan:** Halaman `/about-us` menampilkan **What is HMI One?** dan **Our mission**, beserta pengenalan layanan.
- **Status:** Diotomatisasi.

## Frequently Asked Questions

### FT-FAQ-P01 — Membuka jawaban FAQ

- **Jenis:** Positive; read-only.
- **Langkah:** Buka FAQ dan pilih pertanyaan yang terlihat.
- **Hasil yang diharapkan:** Pertanyaan menunjukkan `aria-expanded=true` dan jawaban terkait tampil.
- **Status:** Diotomatisasi untuk pertanyaan pertama.

### FT-FAQ-N01 — Membuka pertanyaan lain menutup jawaban sebelumnya

- **Jenis:** Negative/state transition; read-only.
- **Langkah:** Buka pertanyaan pertama, lalu buka pertanyaan kedua.
- **Hasil yang diharapkan:** Pertanyaan pertama kembali collapsed dan pertanyaan kedua expanded.
- **Status:** Teramati dan diotomatisasi.

Pada eksplorasi terbaru, memilih kartu spesialis memunculkan pilihan waktu tetapi **Next** tetap nonaktif. Alur pemilihan spesialis sampai tanggal/waktu belum diverifikasi end-to-end; jangan menambah assertion positive sebelum perilaku ini dikonfirmasi.

## Contact Us

### FT-CONTACT-P01 — Memilih topik dan menuju FAQ

- **Jenis:** Positive; read-only.
- **Langkah:** Pilih topik dari dropdown Contact Us, lalu pilih **Visit FAQs**.
- **Hasil yang diharapkan:** Topik terpilih ditampilkan dan halaman FAQ terbuka.
- **Status:** Diotomatisasi. Pilihan yang teramati: Appointment Related, Billing, General Enquiries, dan HMI One Technical Enquiries.

### FT-CONTACT-N01 — Validasi form kosong dan email tidak valid

- **Jenis:** Negative; read-only.
- **Langkah:** Submit form kosong, lalu isi email dengan format tidak valid dan coba submit lagi.
- **Hasil yang diharapkan:** Form menampilkan validasi untuk topik, nama, email, nomor telepon, dan pesan; email tidak valid tetap ditolak.
- **Status:** Diotomatisasi dengan semua POST diblokir di browser agar tidak ada pesan yang dikirim.

## Terms dan Privacy

### FT-LEGAL-P01 — Membuka halaman kebijakan

- **Jenis:** Positive; read-only.
- **Langkah:** Pilih **Terms of Use & Service**, kemudian **Privacy Policy**.
- **Hasil yang diharapkan:** Halaman menampilkan heading **Terms of Use and Service** dan **Data Privacy Notice**.
- **Status:** Diotomatisasi.

## Medical Documents dan profil

### FT-MEDDOC-N01 — Medical Documents meminta autentikasi

- **Jenis:** Negative/access gate; read-only.
- **Langkah:** Buka `/medical-documents` tanpa login.
- **Hasil yang diharapkan:** Halaman menampilkan **Log in or register to access this page** dan aksi Login.
- **Status:** Diotomatisasi untuk sesi tanpa autentikasi.

### FT-MEDDOC-P01 — Dashboard menyediakan tautan Medical Documents

- **Jenis:** Positive; read-only.
- **Langkah:** Dari dashboard terautentikasi, periksa aksi **View now** pada bagian Medical Documents.
- **Hasil yang diharapkan:** Tautan menuju `/medical-documents`.
- **Status:** Diotomatisasi. Test ini hanya memverifikasi tujuan tautan, bukan isi dokumen.

Saat login, dashboard menampilkan tautan **View now** ke `/medical-documents`, tetapi navigasi dari akun QA yang sudah login juga menampilkan prompt login. Perilaku ini perlu dikonfirmasi sebelum menetapkan positive test untuk akses dokumen.

Tautan **View Profile** pada kartu dokter teruji sebagai tautan profil eksternal pada `FT-SPEC-P03`. Untuk profil akun pengguna, FAQ membahas pembaruan profil, tetapi eksplorasi avatar/header tidak membuka menu atau halaman profil melalui klik, Enter, atau hover. Belum ada route atau aksi profil pengguna yang dapat dipastikan dari UI; perlu konfirmasi lokasi/expected behavior sebelum menambah test.

## Dashboard dan navigasi

### FT-DASH-P01 — Buka daftar spesialis dari dashboard

- **Jenis:** Positive; read-only.
- **Langkah:** Dari dashboard terautentikasi, pilih **Browse Specialists**.
- **Hasil yang diharapkan:** Halaman appointment menampilkan tab **Specialists** dan daftar dokter.
- **Status:** Terkonfirmasi; test yang ada lulus.

### FT-DASH-P02 — Buka daftar paket screening dari dashboard

- **Jenis:** Positive; read-only.
- **Langkah:** Dari dashboard terautentikasi, pilih **Browse Packages**.
- **Hasil yang diharapkan:** Tab **Health Screening** dan daftar paket tampil.
- **Status:** Terkonfirmasi; test yang ada lulus.

### FT-DASH-P03 — Buka halaman appointments

- **Jenis:** Positive; read-only.
- **Langkah:** Dari dashboard terautentikasi, pilih **Appointments**.
- **Hasil yang diharapkan:** Bagian **Upcoming Appointments** dan **Past Appointments** tampil.
- **Status:** Kedua bagian teramati. Pada eksplorasi tidak ada kartu appointment.

### FT-DASH-N01 — Akses dashboard dengan trailing slash

- **Jenis:** Negative/regression candidate; read-only.
- **Langkah:** Navigasikan langsung ke `/dashboard/`.
- **Hasil yang diamati:** URL tersebut menghasilkan 404; navigasi dari `/` dan tautan dalam aplikasi bekerja.
- **Keputusan yang diperlukan:** Tentukan apakah trailing slash seharusnya dialihkan ke dashboard. Jangan menjadikan 404 sebagai perilaku yang diharapkan tanpa persetujuan produk.

## Daftar spesialis

### FT-SPEC-P01 — Menampilkan daftar dokter dan memulai booking

- **Jenis:** Positive; read-only hingga submit booking.
- **Langkah:** Buka daftar spesialis, pastikan kartu dokter tampil, lalu pilih **Make Appointment** pada salah satu dokter yang terlihat.
- **Hasil yang diharapkan:** Alur booking terbuka untuk dokter yang dipilih dan menampilkan langkah tanggal/waktu.
- **Status:** Terkonfirmasi untuk dokter yang diamati. Jumlah dan ketersediaan dokter dapat berubah.

### FT-SPEC-P02 — Filter dokter berdasarkan lokasi

- **Jenis:** Positive; read-only.
- **Langkah:** Pilih lokasi yang tersedia pada kontrol **Location**.
- **Hasil yang diharapkan:** Daftar dokter diperbarui sesuai lokasi terpilih.
- **Status:** Kontrol lokasi teramati; pilihan dan hasil filter perlu divalidasi sebelum menetapkan data/assertion.

### FT-SPEC-P03 — Membuka profil dokter

- **Jenis:** Positive; navigasi ke situs eksternal.
- **Langkah:** Pilih **View Profile** pada kartu dokter.
- **Hasil yang diharapkan:** Tautan profil dokter terbuka di tab baru ke URL profil yang sesuai.
- **Status:** Atribut tautan dan perilaku tab baru teramati. Assertion sebaiknya memeriksa tujuan tautan, bukan isi situs eksternal yang dapat berubah.

### FT-SPEC-N01 — Filter tanpa hasil

- **Jenis:** Negative; bersyarat.
- **Langkah:** Pilih filter yang memang tersedia dan menghasilkan nol dokter, jika ada.
- **Hasil yang diharapkan:** Daftar kosong ditangani dengan empty state yang jelas, tanpa menampilkan dokter yang tidak cocok.
- **Catatan:** Belum diketahui apakah UI menyediakan pilihan lokasi tanpa dokter. Jangan membuat data filter fiktif.

## Health screening

### FT-SCR-P01 — Menampilkan paket dan membuka paket yang dipilih

- **Jenis:** Positive; read-only hingga submit booking.
- **Langkah:** Pilih tab **Health Screening**, lalu pilih **Book Now** pada paket tertentu.
- **Hasil yang diharapkan:** Halaman booking menampilkan nama paket yang dipilih dan langkah memilih spesialis.
- **Status:** Terkonfirmasi untuk paket yang diamati.

### FT-SCR-P02 — Melanjutkan setelah memilih spesialis screening

- **Jenis:** Positive; read-only.
- **Langkah:** Pilih spesialis pada alur paket, lalu pilih **Next**.
- **Hasil yang diharapkan:** Langkah tanggal/waktu untuk paket yang sama tampil.
- **Status:** Alur ini tercatat pada smoke suite; pastikan lagi dengan paket dan spesialis yang tersedia saat test berjalan.

### FT-SCR-N01 — Melanjutkan tanpa memilih spesialis

- **Jenis:** Negative; perlu validasi.
- **Langkah:** Buka langkah pemilihan spesialis dan coba lanjutkan tanpa memilih spesialis.
- **Hasil yang diharapkan:** **Next** nonaktif dan alur tidak berpindah ke pemilihan tanggal/waktu.
- **Status:** Teramati dan diotomatisasi.

## Booking appointment

### FT-BOOK-P01 — Memilih slot spesialis dan melihat ringkasan

- **Jenis:** Positive; read-only jika tidak submit.
- **Langkah:** Pilih dokter dan lanjutkan menggunakan slot paling awal yang tersedia.
- **Hasil yang diharapkan:** Detail pribadi untuk dokter yang dipilih tampil.
- **Status:** Diotomatisasi; test ini tidak mengirim booking.

### FT-BOOK-P03 — Memilih tanggal dan waktu tersedia secara manual

- **Jenis:** Positive; read-only.
- **Langkah:** Pilih tanggal yang kalender tandai tersedia dan slot waktu yang berbeda dari pilihan awal.
- **Hasil yang diharapkan:** Tanggal terpilih ditandai aktif dan slot waktu terpilih.
- **Status:** Terkonfirmasi di UAT dan diotomatisasi secara dinamis. Test berhenti sebelum menekan **Next** agar tidak membuat atau memeriksa booking.

### FT-BOOK-P02 — Memilih slot untuk paket screening

- **Jenis:** Positive; read-only jika tidak submit.
- **Langkah:** Pilih paket, spesialis, dan slot tersedia, lalu lanjutkan ke ringkasan.
- **Hasil yang diharapkan:** Ringkasan menunjukkan paket, spesialis, dan slot yang dipilih.
- **Status:** Perlu dijalankan ulang pada data slot yang masih tersedia.

### FT-BOOK-N01 — Memilih tanggal yang tidak tersedia

- **Jenis:** Negative; read-only jika test berhenti sebelum submit.
- **Langkah:** Pada kalender, periksa salah satu tanggal yang UI tandai **Not available**.
- **Hasil yang diharapkan:** Tanggal tidak tersedia dinonaktifkan dan tidak dapat dipilih.
- **Status:** Tanggal tidak tersedia pernah teramati. Pilih tanggal dari state kalender saat test berjalan, jangan memakai tanggal tetap yang sudah lewat.

### FT-BOOK-N02 — Tidak mencentang consent wajib

- **Jenis:** Negative; berpotensi mengubah state.
- **Langkah:** Pada form detail, biarkan consent wajib tidak dicentang dan verifikasi booking tidak dapat berhasil.
- **Hasil yang diharapkan:** Booking ditolak dan tidak ada appointment dibuat.
- **Catatan:** Kedua checkbox terlihat belum dicentang, tetapi **Submit** tetap aktif. Percobaan dengan seluruh detail pribadi dan consent kosong tetap berada di form dan tidak menghasilkan POST ke origin aplikasi; ini belum mengisolasi validasi consent dari validasi detail pribadi. Belum layak dijadikan assertion terotomasi sebelum diuji dengan detail valid dan environment QA terkendali.

### FT-BOOK-N03 — Slot booking konflik

- **Jenis:** Negative; berpotensi mengubah state.
- **Prasyarat:** Environment QA dengan slot konflik yang diketahui.
- **Langkah:** Coba memilih/submit slot yang telah dipakai appointment lain.
- **Hasil yang diharapkan:** Booking ditolak dengan status konflik dan tidak membuat duplikasi.
- **Status:** Pada eksplorasi, menekan **Next** untuk slot yang sudah memiliki konflik menampilkan dialog **Appointment Conflict** dengan pesan bahwa ada appointment pada waktu tersebut dan aksi **Choose Another Slot**. Test otomatis memerlukan slot konflik yang diketahui/stabil; jangan mengasumsikan slot paling awal selalu konflik.

## Pengelolaan appointments

### FT-APT-P01 — Menampilkan appointment dan membuka detail

- **Jenis:** Positive; read-only.
- **Prasyarat:** Appointment QA yang diketahui berada di Upcoming.
- **Langkah:** Buka **Appointments**, temukan kartu berdasarkan dokter serta slot yang tepat, lalu pilih **Details**.
- **Hasil yang diharapkan:** Detail appointment yang dipilih tampil dengan aksi **Reschedule** dan **Cancel Appointment**.
- **Status:** Belum diverifikasi langsung karena tidak ada kartu appointment saat eksplorasi.

### FT-APT-P02 — Reschedule appointment

- **Jenis:** Positive; mengubah state.
- **Prasyarat:** Akun QA khusus; appointment dibuat melalui UI bila belum tersedia dan slot tujuan tersedia.
- **Langkah:** Buka detail appointment, pilih **Reschedule**, pilih slot baru, periksa ringkasan, lalu konfirmasi.
- **Hasil yang diharapkan:** Aplikasi menampilkan hasil reschedule dan appointment terdaftar pada slot baru.
- **Status:** Diotomatisasi di smoke suite; fixture dibuat melalui UI bila belum ada. Kegagalan booking atau konflik slot dilaporkan sebagai failure, bukan skip.

### FT-APT-N01 — Reschedule ke slot konflik

- **Jenis:** Negative; mengubah alur appointment.
- **Prasyarat:** Appointment QA asal dan slot konflik yang diketahui.
- **Langkah:** Coba reschedule ke slot yang tidak tersedia/berkonflik.
- **Hasil yang diharapkan:** Reschedule ditolak; appointment asal tetap ada pada jadwal lama.
- **Status:** Konflik slot pernah ditangani oleh test suite, tetapi hasil state akhir harus diverifikasi pada data QA.

### FT-APT-P03 — Membatalkan appointment

- **Jenis:** Positive; mengubah state.
- **Prasyarat:** Akun QA khusus; appointment dibuat melalui UI bila belum tersedia.
- **Langkah:** Buka detail appointment, pilih **Cancel Appointment**, lalu konfirmasi pembatalan.
- **Hasil yang diharapkan:** Pesan **Your appointment has been cancelled** tampil dan appointment tidak lagi berada di Upcoming.
- **Status:** Diotomatisasi di smoke suite; fixture dibuat melalui UI bila belum ada, lalu status appointment diverifikasi setelah pembatalan.

### FT-APT-N02 — Membatalkan aksi cancel

- **Jenis:** Negative; read-only bila pembatalan tidak dikonfirmasi.
- **Prasyarat:** Appointment QA Upcoming.
- **Langkah:** Buka dialog cancel lalu pilih aksi untuk menutup/membatalkan dialog.
- **Hasil yang diharapkan:** Appointment tetap aktif dan tidak berubah.
- **Catatan:** Label kontrol untuk menutup dialog belum diamati; tentukan locator dari UI aktual sebelum implementasi.

### FT-APT-N03 — Empty state appointment

- **Jenis:** Negative/empty state; read-only.
- **Prasyarat:** Akun QA tanpa Upcoming appointment.
- **Langkah:** Buka halaman **Appointments**.
- **Hasil yang diharapkan:** Halaman menangani daftar kosong dengan jelas dan tetap menyediakan navigasi untuk membuat appointment.
- **Status:** Akun QA tidak menampilkan kartu Upcoming/Past dan tautan **Make an Appointment** tersedia. Teks empty state yang eksplisit tidak teramati; wording/expected result perlu konfirmasi produk.

## Test yang sudah tersedia

Smoke suite dan test data saat ini:

- [Smoke spec](../tests/smoke/hmi-smoke.spec.ts)
- [Test case UAT](../smoke-testcases.md)
- [Appointment test data](../test-data/appointments.ts)

Tanggal di test data bersifat tetap dan perlu diperbarui/ditentukan ulang berdasarkan kalender sebelum test mutating dijalankan.
