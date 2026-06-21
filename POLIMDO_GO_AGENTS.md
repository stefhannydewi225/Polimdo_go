# AGENTS.md
# POLIMDO GO - AI Agent Rules

## Project Name

**POLIMDO GO**

## Project Type

POLIMDO GO adalah aplikasi web MVP untuk skripsi:

**Pengembangan Sistem Presensi Mahasiswa Berbasis QR Code dan Geolocation Menggunakan Metode Radius Validation untuk Mencegah Kecurangan Kehadiran pada Politeknik Negeri Manado**

Project ini fokus pada sistem presensi mahasiswa, bukan aplikasi kampus super lengkap.

---

## Main Goal

Bangun aplikasi web presensi mahasiswa berbasis:

- QR Code
- Geolocation
- Radius Validation
- Dashboard mahasiswa
- Dashboard dosen
- Dashboard admin
- Rekap dan riwayat presensi

Presensi dianggap valid hanya jika mahasiswa berhasil scan QR Code yang valid dan berada di dalam radius lokasi kelas/kampus yang ditentukan.

---

## Tech Stack Wajib

Gunakan stack berikut:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Prisma ORM
- Auth.js / NextAuth
- Zod
- Browser Geolocation API
- QR Code generator
- QR Code scanner

Jangan mengganti tech stack tanpa izin user.

---

## Ponytail Compatibility

Project ini menggunakan skill:

https://github.com/DietrichGebert/ponytail

Aturan:

1. Ikuti aturan Ponytail jika berkaitan dengan workflow agent, patching, file editing, dan format kerja.
2. Jangan mengubah konfigurasi Ponytail kecuali diminta user.
3. Jika file Ponytail/skill tersedia di repo, baca terlebih dahulu sebelum coding.
4. Jika ada konflik instruksi:
   - Instruksi user terbaru memiliki prioritas tertinggi.
   - Lalu `AGENTS.md`.
   - Lalu `AI_CONTEXT.md`.
   - Lalu aturan Ponytail.
   - Lalu best practice umum coding.
5. Jangan mengarang isi Ponytail jika belum dibaca dari project.

---

## Scope MVP

Agent hanya boleh mengerjakan fitur berikut:

### Auth

- Login
- Logout
- Session
- Role guard untuk mahasiswa, dosen, admin

### Mahasiswa

- Dashboard mahasiswa
- Melihat jadwal
- Melihat sesi presensi aktif
- Scan QR Code
- Memberikan izin lokasi
- Mengirim presensi
- Melihat hasil presensi
- Melihat riwayat presensi

### Dosen

- Dashboard dosen
- Membuat sesi presensi
- Generate QR Code
- Menampilkan QR Code
- Menutup sesi presensi
- Melihat daftar kehadiran mahasiswa
- Melihat data jarak dan status validasi

### Admin

- Dashboard admin
- Mengelola mahasiswa
- Mengelola dosen
- Mengelola mata kuliah
- Mengelola kelas
- Mengelola ruangan/lokasi
- Mengelola jadwal

---

## Out of Scope

Jangan membuat fitur berikut kecuali user meminta secara eksplisit:

- Pembayaran kampus
- Chat
- Forum
- E-learning
- Upload tugas
- Marketplace
- Perpustakaan digital
- Kartu mahasiswa digital kompleks
- Face recognition
- Fingerprint
- GPS tracking real-time
- Push notification kompleks
- Mobile native app
- Microservices
- Multi-campus enterprise system
- PostGIS
- Sistem akademik super app

Project ini adalah MVP skripsi, bukan aplikasi kampus penuh.

---

## Required Pages

Gunakan struktur route berikut sebagai default.

### Auth

- `/login`

### Student

- `/student/dashboard`
- `/student/schedule`
- `/student/attendance`
- `/student/attendance/scan`
- `/student/history`
- `/student/profile`

### Lecturer

- `/lecturer/dashboard`
- `/lecturer/sessions`
- `/lecturer/sessions/new`
- `/lecturer/sessions/[id]`
- `/lecturer/sessions/[id]/qr`
- `/lecturer/sessions/[id]/records`

### Admin

- `/admin/dashboard`
- `/admin/students`
- `/admin/lecturers`
- `/admin/courses`
- `/admin/classes`
- `/admin/rooms`
- `/admin/schedules`

---

## Required Folder Structure

Gunakan struktur folder berikut kecuali ada alasan kuat.

```txt
src/
  app/
    login/
      page.tsx

    student/
      dashboard/
        page.tsx
      schedule/
        page.tsx
      attendance/
        page.tsx
        scan/
          page.tsx
      history/
        page.tsx
      profile/
        page.tsx

    lecturer/
      dashboard/
        page.tsx
      sessions/
        page.tsx
        new/
          page.tsx
        [id]/
          page.tsx
          qr/
            page.tsx
          records/
            page.tsx

    admin/
      dashboard/
        page.tsx
      students/
        page.tsx
      lecturers/
        page.tsx
      courses/
        page.tsx
      classes/
        page.tsx
      rooms/
        page.tsx
      schedules/
        page.tsx

    api/
      attendance/
        submit/
          route.ts
      sessions/
        route.ts
        [id]/
          close/
            route.ts

  components/
    ui/
      Button.tsx
      Card.tsx
      Input.tsx
      Select.tsx
      Badge.tsx
      DataTable.tsx
      EmptyState.tsx
      LoadingState.tsx

    layout/
      AppShell.tsx
      DashboardShell.tsx
      BottomNav.tsx
      Sidebar.tsx
      Topbar.tsx

    attendance/
      QRCodeDisplay.tsx
      QRScanner.tsx
      LocationPermissionCard.tsx
      AttendanceResultCard.tsx
      AttendanceSessionCard.tsx

    dashboard/
      StatCard.tsx
      ScheduleCard.tsx

  lib/
    auth.ts
    prisma.ts
    distance.ts
    qr-token.ts
    constants.ts
    utils.ts
    validations/
      attendance.ts
      session.ts
      auth.ts

  server/
    attendance/
      submit-attendance.ts
      get-attendance-history.ts
    sessions/
      create-session.ts
      close-session.ts
      get-session-records.ts
    admin/
      students.ts
      lecturers.ts
      courses.ts
      classes.ts
      rooms.ts
      schedules.ts

  types/
    attendance.ts
    auth.ts
    dashboard.ts

prisma/
  schema.prisma
  seed.ts
```

Jangan membuat struktur yang terlalu kompleks untuk MVP.

---

## UI/UX Rules

Desain harus:

- Minimalis
- Mobile-first
- Mudah dibaca
- Banyak whitespace
- Clean card layout
- Bahasa Indonesia
- Tailwind CSS friendly
- Tidak terlalu banyak warna
- Tidak memakai dekorasi berlebihan
- Fokus pada kejelasan status presensi

Gunakan warna status:

- Valid / Hadir: green
- Ditolak / Error: red
- Warning / Pending: amber
- Inactive / Closed: gray
- Accent utama: indigo atau purple

Contoh label UI:

- "Scan QR Presensi"
- "Aktifkan Lokasi"
- "Kirim Presensi"
- "Presensi Berhasil"
- "Presensi Ditolak"
- "Kamu berada di luar radius presensi"
- "QR Code sudah kedaluwarsa"
- "Sesi presensi sudah ditutup"
- "Buat Sesi Presensi"
- "Tutup Sesi"
- "Lihat Kehadiran"

---

## Database Rules

Database memakai:

- Supabase PostgreSQL
- Prisma ORM

Aturan:

1. Jangan query database dari client component.
2. Semua akses database harus server-side.
3. Jangan expose `DATABASE_URL`.
4. Jangan commit `.env`.
5. Gunakan migration Prisma.
6. Gunakan seed untuk data demo.
7. Jangan menggunakan MongoDB.
8. Jangan menggunakan PostGIS untuk MVP kecuali user meminta.

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

Jangan pernah menulis secret asli ke source code.

---

## Required Database Models

Minimal konsep model:

- User
- StudentProfile
- LecturerProfile
- Course
- Class
- RoomLocation
- Schedule
- AttendanceSession
- AttendanceRecord

Status utama:

- AttendanceSessionStatus: ACTIVE, CLOSED, EXPIRED
- AttendanceRecordStatus: VALID, REJECTED
- AttendanceRejectionReason:
  - INVALID_TOKEN
  - QR_EXPIRED
  - SESSION_CLOSED
  - OUT_OF_RADIUS
  - ALREADY_ATTENDED
  - LOCATION_UNAVAILABLE
  - NOT_IN_SCHEDULE

---

## QR Code Rules

QR Code tidak boleh langsung berisi data sensitif.

QR Code boleh berisi:

```txt
https://domain.com/student/attendance/scan?token=RANDOM_TOKEN
```

Aturan QR:

1. Token harus random.
2. Token harus punya expired time.
3. Token tidak boleh mudah ditebak.
4. Simpan hash token di database jika memungkinkan.
5. Validasi token wajib di server.
6. Jangan menerima presensi hanya karena QR berhasil discan.
7. Token expired harus menghasilkan status rejected.

---

## Geolocation Rules

Flow geolocation:

1. Mahasiswa scan QR.
2. Browser meminta izin lokasi.
3. Frontend mengambil latitude dan longitude.
4. Frontend mengirim token, latitude, longitude ke server.
5. Server mengambil lokasi ruangan/kampus dari database.
6. Server menghitung jarak.
7. Server menentukan valid atau rejected.

Jangan validasi radius hanya di frontend.

---

## Radius Validation Rules

Gunakan Haversine formula di server.

Presensi valid jika:

```txt
distanceInMeters <= radiusMeters
```

Jika jarak lebih besar dari radius:

```txt
status = REJECTED
rejectionReason = OUT_OF_RADIUS
```

Simpan jarak dalam `distanceMeters`.

---

## Attendance Validation Rules

Server wajib mengecek:

1. User sudah login.
2. User role adalah STUDENT.
3. Token QR valid.
4. Token belum expired.
5. Sesi masih ACTIVE.
6. Waktu sekarang masih dalam rentang sesi.
7. Mahasiswa belum pernah presensi di sesi yang sama.
8. Latitude dan longitude valid.
9. Jarak mahasiswa masih dalam radius.
10. Simpan hasil presensi.

Jika gagal, simpan record rejected jika memungkinkan untuk audit skripsi.

---

## Security Rules

Wajib:

- Validasi semua input dengan Zod.
- Validasi role server-side.
- Jangan percaya data dari client.
- Jangan simpan password plaintext.
- Gunakan bcrypt jika memakai credentials.
- Gunakan Auth.js / NextAuth.
- Jangan expose secret ke browser.
- Jangan hardcode secret.
- Jangan query Prisma dari client.
- Cegah presensi ganda.
- Token QR harus random dan expired.

---

## Development Rules

Agent wajib:

1. Baca `AGENTS.md` dan `AI_CONTEXT.md` sebelum coding.
2. Cek struktur project sebelum patch.
3. Jangan rewrite total project tanpa izin.
4. Jangan ubah tech stack.
5. Jangan tambah fitur di luar MVP.
6. Jangan buat dummy palsu untuk fitur utama.
7. Jangan overengineering.
8. Jangan membuat UI terlalu ramai.
9. Jangan membuat route tanpa role guard.
10. Jangan menghapus file tanpa alasan jelas.
11. Jangan mengubah foldering besar tanpa izin.
12. Jangan melakukan migration destruktif tanpa izin.
13. Jangan mengklaim fitur selesai jika belum dites.
14. Jika ada error, jelaskan root cause dan patch yang dilakukan.

---

## Recommended Work Order

Kerjakan project dengan urutan:

1. Setup Next.js + Tailwind + TypeScript.
2. Setup Prisma + Supabase PostgreSQL.
3. Buat schema Prisma.
4. Buat seed data demo.
5. Setup Auth.js / NextAuth.
6. Buat layout dan UI dasar.
7. Buat role guard.
8. Buat halaman mahasiswa.
9. Buat halaman dosen.
10. Buat halaman admin.
11. Buat QR session.
12. Buat QR scanner.
13. Buat geolocation request.
14. Buat radius validation server-side.
15. Buat attendance records.
16. Buat testing scenario.
17. Rapikan UI dan validasi.
18. Dokumentasikan cara demo.

---

## Output Format After Coding

Setiap selesai coding, laporkan:

```md
Selesai.

1. Files changed
- ...

2. Fitur yang dibuat
- ...

3. Validasi/security
- ...

4. Cara test
- ...

5. Catatan/limitasi
- ...
```

Jawaban harus singkat, jelas, dan fokus ke hasil.

---

## Final Reminder

Fokus utama POLIMDO GO:

```txt
QR Code + Geolocation + Radius Validation + Attendance Record
```

Jangan melebar menjadi aplikasi kampus super lengkap.
