# SKILL.md

# Project Skill: Sistem Presensi Mahasiswa QR Code + Geolocation

## Project Identity

Project ini adalah aplikasi web MVP untuk skripsi:

**Pengembangan Sistem Presensi Mahasiswa Berbasis QR Code dan Geolocation Menggunakan Metode Radius Validation untuk Mencegah Kecurangan Kehadiran**

Aplikasi ini bukan aplikasi kampus super lengkap seperti AMIKOM One.
Aplikasi ini hanya mengambil konsep layanan akademik, tetapi fokus utama tetap pada:

* Presensi mahasiswa
* QR Code attendance
* Geolocation validation
* Radius validation
* Pencegahan kecurangan kehadiran
* Dashboard dosen/admin untuk monitoring presensi

Jangan membuat fitur di luar scope MVP kecuali user meminta secara eksplisit.

---

## Tech Stack Wajib

Gunakan stack berikut:

* Next.js App Router
* TypeScript
* Tailwind CSS
* Supabase PostgreSQL
* Prisma ORM
* Auth.js / NextAuth
* Zod
* React Hook Form jika dibutuhkan
* QR Code generator library
* Browser Geolocation API

Database utama tetap melalui:

* PostgreSQL di Supabase
* Prisma sebagai ORM

Jangan menggunakan MongoDB untuk project ini.

---

## Ponytail Skill Compatibility

Project ini menggunakan skill dari:

https://github.com/DietrichGebert/ponytail

Aturan:

1. Ikuti aturan Ponytail jika berkaitan dengan workflow agent, patching, file editing, atau format kerja.
2. Skill ini adalah aturan domain project.
3. Jika ada konflik:

   * Instruksi user terbaru memiliki prioritas tertinggi.
   * Lalu aturan keamanan dan scope di SKILL.md ini.
   * Lalu aturan Ponytail.
   * Lalu kebiasaan umum coding agent.
4. Jangan mengabaikan Ponytail.
5. Jangan mengubah konfigurasi Ponytail kecuali user meminta.
6. Jangan membuat asumsi tentang isi Ponytail yang belum dibaca dari project.
7. Jika file aturan Ponytail tersedia di repo, baca dulu sebelum coding.

---

## Main Goal

Bangun MVP aplikasi web presensi mahasiswa yang memungkinkan:

1. Mahasiswa login.
2. Mahasiswa melihat jadwal/sesi presensi aktif.
3. Dosen membuat sesi presensi.
4. Sistem membuat QR Code untuk sesi presensi.
5. Mahasiswa scan QR Code.
6. Sistem mengambil lokasi mahasiswa.
7. Server menghitung jarak mahasiswa dari titik lokasi kelas/kampus.
8. Presensi diterima hanya jika:

   * QR valid
   * Token belum expired
   * Sesi masih aktif
   * Mahasiswa berada dalam radius valid
   * Mahasiswa belum presensi sebelumnya
9. Dosen/admin dapat melihat hasil presensi.
10. Sistem menyimpan data valid dan rejected untuk kebutuhan analisis skripsi.

---

## Out of Scope

Jangan membuat fitur berikut kecuali diminta eksplisit oleh user:

* Pembayaran kampus
* E-learning lengkap
* Upload tugas
* Chat mahasiswa-dosen
* Forum diskusi
* Marketplace kampus
* Perpustakaan digital
* Kartu mahasiswa digital kompleks
* Face recognition
* Fingerprint
* GPS tracking real-time terus-menerus
* Push notification kompleks
* Multi-kampus kompleks
* Mobile native app
* Super app akademik lengkap

Fokus hanya pada presensi.

---

## User Roles

Aplikasi minimal memiliki 3 role:

### Mahasiswa

Mahasiswa bisa:

* Login
* Melihat dashboard
* Melihat jadwal atau sesi aktif
* Scan QR Code
* Mengirim lokasi
* Melihat status presensi
* Melihat riwayat presensi

### Dosen

Dosen bisa:

* Login
* Melihat dashboard
* Membuat sesi presensi
* Generate QR Code presensi
* Membuka/menutup sesi
* Melihat daftar mahasiswa hadir
* Melihat data validasi lokasi

### Admin

Admin bisa:

* Login
* Mengelola data mahasiswa
* Mengelola data dosen
* Mengelola mata kuliah
* Mengelola kelas
* Mengelola ruangan/lokasi
* Mengelola jadwal

Untuk MVP awal, admin boleh dibuat sederhana.

---

## Required Pages

Gunakan route seperti ini kecuali user meminta struktur lain.

### Auth

* `/login`

### Student

* `/student/dashboard`
* `/student/schedule`
* `/student/attendance`
* `/student/attendance/scan`
* `/student/history`

### Lecturer

* `/lecturer/dashboard`
* `/lecturer/sessions`
* `/lecturer/sessions/new`
* `/lecturer/sessions/[id]`
* `/lecturer/sessions/[id]/qr`
* `/lecturer/sessions/[id]/records`

### Admin

* `/admin/dashboard`
* `/admin/students`
* `/admin/lecturers`
* `/admin/courses`
* `/admin/classes`
* `/admin/rooms`
* `/admin/schedules`

---

## UI/UX Rules

UI harus:

* Mobile-first
* Clean
* Sederhana
* Bahasa Indonesia
* Cocok untuk mahasiswa
* Tidak terlalu ramai
* Tidak terlalu banyak menu
* Menggunakan Tailwind CSS
* Menggunakan komponen reusable
* Mudah dipakai saat presensi di kelas

Prioritas tampilan:

1. Mahasiswa cepat menemukan tombol presensi.
2. Error harus jelas.
3. Status presensi harus mudah dipahami.
4. Dosen mudah melihat siapa yang hadir.

Gunakan teks error seperti:

* "Lokasi tidak ditemukan. Aktifkan izin lokasi."
* "Kamu berada di luar radius presensi."
* "QR Code sudah kedaluwarsa."
* "Sesi presensi sudah ditutup."
* "Kamu sudah melakukan presensi."
* "Token presensi tidak valid."
* "Browser tidak mendukung geolocation."

---

## Database Stack

Gunakan:

* Supabase PostgreSQL sebagai database
* Prisma ORM sebagai database access layer

Jangan query database langsung dari client.

Semua query database harus lewat:

* Server Component
* Server Action
* Route Handler
* API server-side
* Prisma client server-side

Jangan expose `DATABASE_URL` ke frontend.

---

## Required Environment Variables

Minimal `.env`:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

AUTH_SECRET="generate-secret-here"
NEXTAUTH_URL="http://localhost:3000"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Catatan:

* `DATABASE_URL` dipakai Prisma.
* `DIRECT_URL` dipakai migration Supabase jika dibutuhkan.
* `AUTH_SECRET` wajib untuk Auth.js.
* Jangan commit `.env`.

---

## Recommended Dependencies

Install dependency minimal:

```bash
npm install @prisma/client zod next-auth bcryptjs qrcode
npm install -D prisma @types/bcryptjs @types/qrcode
```

Untuk QR scanner, pilih salah satu:

```bash
npm install html5-qrcode
```

atau:

```bash
npm install @yudiel/react-qr-scanner
```

Jangan install banyak library QR scanner sekaligus tanpa alasan.

---

## Prisma Models Minimal

Gunakan model minimal seperti ini sebagai dasar. Agent boleh menyesuaikan, tapi jangan menghapus konsep utama.

```prisma
enum UserRole {
  STUDENT
  LECTURER
  ADMIN
}

enum AttendanceSessionStatus {
  ACTIVE
  CLOSED
  EXPIRED
}

enum AttendanceRecordStatus {
  VALID
  REJECTED
}

enum AttendanceRejectionReason {
  INVALID_TOKEN
  QR_EXPIRED
  SESSION_CLOSED
  OUT_OF_RADIUS
  ALREADY_ATTENDED
  LOCATION_UNAVAILABLE
  NOT_IN_SCHEDULE
}

model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         UserRole
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  studentProfile  StudentProfile?
  lecturerProfile LecturerProfile?
}

model StudentProfile {
  id        String @id @default(cuid())
  userId    String @unique
  nim       String @unique
  program   String
  classId   String?

  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  class     Class? @relation(fields: [classId], references: [id])

  attendanceRecords AttendanceRecord[]
}

model LecturerProfile {
  id     String @id @default(cuid())
  userId String @unique
  nidn   String? @unique

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  courses            Course[]
  attendanceSessions AttendanceSession[]
}

model Course {
  id         String @id @default(cuid())
  name       String
  code       String @unique
  lecturerId String?

  lecturer   LecturerProfile? @relation(fields: [lecturerId], references: [id])
  schedules  Schedule[]
}

model Class {
  id       String @id @default(cuid())
  name     String
  program  String?

  students  StudentProfile[]
  schedules Schedule[]
}

model RoomLocation {
  id           String  @id @default(cuid())
  name         String
  latitude     Decimal @db.Decimal(10, 7)
  longitude    Decimal @db.Decimal(10, 7)
  defaultRadiusMeters Int @default(50)

  schedules Schedule[]
}

model Schedule {
  id        String @id @default(cuid())
  courseId  String
  classId   String
  roomId    String

  dayOfWeek Int
  startTime String
  endTime   String

  course Course       @relation(fields: [courseId], references: [id])
  class  Class        @relation(fields: [classId], references: [id])
  room   RoomLocation @relation(fields: [roomId], references: [id])

  sessions AttendanceSession[]
}

model AttendanceSession {
  id          String @id @default(cuid())
  scheduleId  String
  lecturerId  String

  tokenHash      String
  tokenExpiresAt DateTime

  startAt      DateTime
  endAt        DateTime
  radiusMeters Int

  status AttendanceSessionStatus @default(ACTIVE)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  schedule Schedule        @relation(fields: [scheduleId], references: [id])
  lecturer LecturerProfile @relation(fields: [lecturerId], references: [id])

  records AttendanceRecord[]
}

model AttendanceRecord {
  id        String @id @default(cuid())
  sessionId String
  studentId String

  checkedInAt DateTime @default(now())

  studentLatitude  Decimal? @db.Decimal(10, 7)
  studentLongitude Decimal? @db.Decimal(10, 7)
  distanceMeters   Float?

  status AttendanceRecordStatus
  rejectionReason AttendanceRejectionReason?

  userAgent String?
  ipAddress String?

  session AttendanceSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  student StudentProfile    @relation(fields: [studentId], references: [id])

  @@unique([sessionId, studentId])
}
```

---

## QR Code Rules

QR Code tidak boleh langsung berisi data sensitif.

QR Code cukup berisi:

* Session token
* Atau URL presensi dengan token

Contoh:

```txt
https://domain.com/student/attendance/scan?token=RANDOM_TOKEN
```

Aturan QR:

1. Token harus random.
2. Token harus punya expired time.
3. Token tidak boleh mudah ditebak.
4. Token sebaiknya disimpan dalam bentuk hash di database.
5. Validasi token wajib di server.
6. Jangan menerima presensi hanya karena QR berhasil discan.

---

## Geolocation Rules

Saat mahasiswa scan QR:

1. Frontend meminta izin lokasi.
2. Frontend mengambil latitude dan longitude.
3. Frontend mengirim token QR dan koordinat ke server.
4. Server mengambil data sesi presensi.
5. Server mengambil koordinat ruangan/lokasi dari database.
6. Server menghitung jarak.
7. Server memutuskan valid/rejected.

Jangan validasi radius hanya di frontend.

---

## Radius Validation

Gunakan Haversine formula di server.

Presensi valid jika:

```txt
distanceInMeters <= radiusMeters
```

Jika lebih besar:

```txt
status = REJECTED
rejectionReason = OUT_OF_RADIUS
```

Simpan `distanceMeters` agar bisa dianalisis di skripsi.

---

## Server Validation Rules

Saat menerima request presensi, server wajib cek:

1. User sudah login.
2. User role adalah STUDENT.
3. Token QR valid.
4. Token belum expired.
5. Sesi masih ACTIVE.
6. Waktu sekarang masih dalam rentang sesi.
7. Mahasiswa belum presensi di sesi yang sama.
8. Lokasi dikirim dan valid.
9. Jarak mahasiswa masih dalam radius.
10. Simpan hasil presensi.

Jika gagal, tetap simpan record rejected jika memungkinkan untuk kebutuhan audit/log skripsi.

---

## Security Rules

Wajib:

* Jangan percaya data dari client.
* Validasi semua input dengan Zod.
* Validasi role di server.
* Jangan expose `DATABASE_URL`.
* Jangan simpan password plaintext.
* Gunakan `bcryptjs` untuk hash password jika memakai credential login.
* Gunakan session authentication.
* Gunakan Prisma server-side only.
* QR token harus random dan expired.
* Cegah presensi ganda.
* Jangan simpan secret di frontend.
* Jangan mengandalkan geolocation sebagai satu-satunya keamanan absolut.
* Tampilkan geolocation sebagai metode mitigasi kecurangan, bukan jaminan 100%.

---

## Important Limitation Text

Jika membuat dokumentasi, jelaskan limitasi berikut:

* GPS browser bisa tidak akurat tergantung device.
* Mahasiswa bisa menolak izin lokasi.
* Geolocation bisa dipengaruhi sinyal, indoor area, dan permission browser.
* Radius validation membantu mengurangi kecurangan, tetapi tidak menjamin 100% anti-cheat.
* Untuk keamanan lebih tinggi, bisa dikembangkan dengan QR dinamis, device binding, Wi-Fi validation, atau face verification pada versi berikutnya.

---

## Recommended Folder Structure

Gunakan struktur seperti ini:

```txt
src/
  app/
    login/
    student/
      dashboard/
      schedule/
      attendance/
      history/
    lecturer/
      dashboard/
      sessions/
    admin/
      dashboard/
      students/
      lecturers/
      courses/
      classes/
      rooms/
      schedules/
    api/
      attendance/
      sessions/
  components/
    ui/
    layout/
    attendance/
    dashboard/
  lib/
    auth.ts
    prisma.ts
    distance.ts
    qr-token.ts
    validations/
  server/
    attendance/
    sessions/
  types/
prisma/
  schema.prisma
  seed.ts
```

Jangan membuat struktur terlalu kompleks untuk MVP.

---

## Required Utility Files

Minimal buat utility berikut:

### `src/lib/prisma.ts`

Untuk Prisma client singleton.

### `src/lib/distance.ts`

Untuk Haversine formula.

### `src/lib/qr-token.ts`

Untuk generate token, hash token, dan compare token.

### `src/lib/auth.ts`

Untuk konfigurasi Auth.js / NextAuth.

### `src/lib/validations/attendance.ts`

Untuk schema validasi Zod request presensi.

---

## Attendance Submit Flow

Flow wajib:

```txt
Mahasiswa login
→ buka halaman scan
→ scan QR
→ browser minta lokasi
→ frontend kirim token + latitude + longitude
→ server validasi token
→ server validasi session
→ server hitung radius
→ server simpan record
→ frontend tampilkan hasil
```

Hasil sukses:

```txt
Presensi berhasil.
Jarak kamu dari lokasi kelas: 24 meter.
```

Hasil gagal:

```txt
Presensi ditolak.
Alasan: Kamu berada di luar radius presensi.
Jarak kamu dari lokasi kelas: 182 meter.
Radius yang diizinkan: 50 meter.
```

---

## Lecturer Session Flow

Flow dosen:

```txt
Dosen login
→ buka dashboard
→ pilih jadwal
→ buat sesi presensi
→ sistem generate token
→ sistem tampilkan QR Code
→ mahasiswa scan
→ dosen melihat daftar hadir
→ dosen menutup sesi
```

---

## Admin Flow

Flow admin:

```txt
Admin login
→ input data mahasiswa
→ input data dosen
→ input data mata kuliah
→ input data kelas
→ input data ruangan/lokasi
→ input jadwal
```

Untuk MVP, input data boleh sederhana.

---

## Data Seeding

Buat seed minimal:

* 1 admin
* 1 dosen
* 3 mahasiswa
* 1 mata kuliah
* 1 kelas
* 1 ruangan/lokasi
* 1 jadwal

Seed penting agar demo skripsi mudah dilakukan.

---

## Testing Rules

Setelah implementasi, siapkan cara test:

1. Login sebagai admin.
2. Buat data ruangan dengan latitude/longitude.
3. Buat jadwal.
4. Login sebagai dosen.
5. Buat sesi presensi.
6. Tampilkan QR Code.
7. Login sebagai mahasiswa.
8. Scan QR.
9. Izinkan lokasi.
10. Pastikan presensi valid jika dalam radius.
11. Ubah radius kecil untuk test rejected.
12. Test QR expired.
13. Test presensi dua kali.
14. Test sesi ditutup.

---

## Development Behavior Rules for AI Agent

Saat coding, agent wajib:

1. Baca struktur project terlebih dahulu.
2. Jangan langsung rewrite seluruh project.
3. Jangan menghapus file penting tanpa izin.
4. Jangan mengubah tech stack tanpa izin.
5. Jangan menambah fitur di luar MVP.
6. Jangan membuat desain terlalu kompleks.
7. Jangan membuat dummy logic palsu untuk fitur utama.
8. Jangan validasi radius hanya di frontend.
9. Jangan menyimpan token QR plaintext jika sudah ada sistem hash.
10. Jangan expose secret ke client.
11. Jangan hardcode koordinat kecuali untuk seed/demo.
12. Jangan membuat route admin/dosen/mahasiswa tanpa role guard.
13. Jangan membuat query database dari client component.
14. Jangan membuat fitur pembayaran, chat, atau e-learning.
15. Jangan menggunakan library berat tanpa alasan.
16. Jangan mengubah nama project atau arah skripsi.
17. Jangan menambahkan PostGIS untuk MVP kecuali diminta.
18. Jangan membuat aplikasi native mobile.
19. Jangan membuat microservices.
20. Jangan membuat arsitektur berlebihan.

---

## Coding Style

Gunakan:

* TypeScript strict-friendly
* Naming yang jelas
* Function kecil dan reusable
* Server logic dipisah dari UI
* Validasi Zod untuk request penting
* Tailwind untuk styling
* Komponen sederhana
* Bahasa Indonesia untuk UI text

Hindari:

* Any berlebihan
* Logic besar di komponen UI
* Copy-paste komponen panjang
* Inline secret
* Query Prisma di client component
* Overengineering

---

## Tailwind UI Direction

Gunakan style:

* Background terang netral
* Card layout
* Border halus
* Rounded corners
* Spacing rapi
* Button jelas
* Status badge

Contoh status badge:

* Hadir: hijau
* Ditolak: merah
* Menunggu: kuning/amber
* Ditutup: abu-abu

Jangan membuat UI terlalu ramai.

---

## Suggested MVP Components

Buat komponen reusable:

* `AppShell`
* `Sidebar`
* `Topbar`
* `StatCard`
* `StatusBadge`
* `ScheduleCard`
* `AttendanceSessionCard`
* `QRCodeDisplay`
* `QRScanner`
* `LocationPermissionCard`
* `AttendanceResultCard`
* `DataTable`
* `EmptyState`
* `LoadingState`

---

## API / Server Actions

Minimal endpoint atau server action:

### Auth

* Login
* Logout
* Get current session

### Attendance Session

* Create session
* Close session
* Get session detail
* Get session QR token
* Get session records

### Attendance Submit

* Submit attendance with token and location

Request submit attendance:

```ts
{
  token: string;
  latitude: number;
  longitude: number;
}
```

Response sukses:

```ts
{
  success: true;
  status: "VALID";
  distanceMeters: number;
  message: string;
}
```

Response gagal:

```ts
{
  success: false;
  status: "REJECTED";
  reason: string;
  distanceMeters?: number;
  message: string;
}
```

---

## Required Business Rules

Presensi valid hanya jika:

```txt
QR valid
AND token belum expired
AND sesi aktif
AND waktu presensi masih valid
AND mahasiswa belum presensi
AND lokasi tersedia
AND jarak <= radius
```

Selain itu rejected.

---

## Documentation Required

Jika diminta dokumentasi, buat bagian:

1. Latar belakang
2. Rumusan masalah
3. Tujuan
4. Batasan masalah
5. Metode radius validation
6. Flow sistem
7. ERD
8. Use case
9. Activity diagram
10. Pengujian
11. Limitasi sistem

Jangan membuat klaim sistem 100% anti-kecurangan. Gunakan kalimat:

```txt
Sistem ini bertujuan mengurangi potensi kecurangan presensi dengan menggabungkan validasi QR Code dan lokasi mahasiswa berdasarkan radius yang telah ditentukan.
```

---

## Output Format After Agent Finishes Coding

Setiap selesai coding, laporkan dengan format:

```md
Build/patch selesai.

1. Files changed
- ...

2. Fitur yang dibuat
- ...

3. Validasi/security
- ...

4. Cara test
- ...

5. Limitasi
- ...
```

Jangan terlalu panjang. Fokus ke hasil.

---

## Final Reminder

Project ini adalah MVP skripsi.

Fokus utama:

```txt
QR Code + Geolocation + Radius Validation + Attendance Record
```

Jangan melebar menjadi aplikasi kampus lengkap.
