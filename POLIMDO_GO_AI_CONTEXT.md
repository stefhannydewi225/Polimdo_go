# AI_CONTEXT.md
# POLIMDO GO - Project Context

## Ringkasan Project

**POLIMDO GO** adalah aplikasi web MVP untuk sistem presensi mahasiswa di Politeknik Negeri Manado.

Project ini dibuat untuk skripsi dengan topik:

**Pengembangan Sistem Presensi Mahasiswa Berbasis QR Code dan Geolocation Menggunakan Metode Radius Validation untuk Mencegah Kecurangan Kehadiran pada Politeknik Negeri Manado**

Aplikasi ini bertujuan membantu proses presensi mahasiswa agar lebih terkontrol dengan kombinasi:

- QR Code sebagai validasi sesi presensi
- Geolocation sebagai validasi lokasi mahasiswa
- Radius Validation sebagai metode validasi jarak
- Riwayat presensi sebagai bukti dan audit

---

## Batasan Project

Project ini bukan aplikasi akademik penuh.

Project ini bukan pengganti seluruh sistem kampus.

Project ini hanya fokus pada modul presensi mahasiswa.

Fitur seperti pembayaran, e-learning, chat, forum, perpustakaan, atau marketplace tidak masuk MVP.

---

## Target User

### 1. Mahasiswa

Mahasiswa menggunakan sistem untuk:

- Login
- Melihat jadwal
- Melihat sesi presensi aktif
- Scan QR presensi
- Mengaktifkan lokasi
- Mengirim presensi
- Melihat hasil presensi
- Melihat riwayat presensi

### 2. Dosen

Dosen menggunakan sistem untuk:

- Login
- Membuat sesi presensi
- Generate QR Code
- Menampilkan QR Code kepada mahasiswa
- Menutup sesi presensi
- Melihat daftar kehadiran
- Melihat status validasi lokasi mahasiswa

### 3. Admin

Admin menggunakan sistem untuk:

- Mengelola data mahasiswa
- Mengelola data dosen
- Mengelola mata kuliah
- Mengelola kelas
- Mengelola ruangan/lokasi
- Mengelola jadwal

---

## Core Problem

Presensi manual atau presensi biasa dapat memiliki celah kecurangan, seperti:

- Titip absen
- Scan QR dari luar lokasi kelas
- Presensi di luar waktu kelas
- Presensi ganda
- Menggunakan QR yang sudah tidak berlaku

POLIMDO GO mengurangi potensi kecurangan dengan cara:

1. QR Code dibuat per sesi presensi.
2. Token QR punya masa berlaku.
3. Mahasiswa harus mengirim lokasi.
4. Server menghitung jarak mahasiswa dari lokasi kelas.
5. Presensi hanya valid jika mahasiswa berada dalam radius yang ditentukan.

---

## Main Validation Concept

Presensi valid jika semua kondisi terpenuhi:

```txt
User login sebagai mahasiswa
AND QR token valid
AND token belum expired
AND sesi masih aktif
AND waktu masih sesuai
AND mahasiswa belum presensi
AND lokasi tersedia
AND jarak mahasiswa <= radius yang diizinkan
```

Jika salah satu gagal, presensi ditolak.

---

## Radius Validation

Radius Validation adalah metode untuk menentukan apakah mahasiswa berada di area yang diperbolehkan.

Data yang digunakan:

- Latitude mahasiswa
- Longitude mahasiswa
- Latitude lokasi kelas/ruangan
- Longitude lokasi kelas/ruangan
- Radius yang diizinkan dalam meter

Formula:

- Gunakan Haversine formula di server.
- Output jarak dalam meter.

Contoh:

```txt
Jarak mahasiswa: 24 meter
Radius diizinkan: 50 meter
Status: VALID
```

Contoh gagal:

```txt
Jarak mahasiswa: 182 meter
Radius diizinkan: 50 meter
Status: DITOLAK
Alasan: OUT_OF_RADIUS
```

---

## Tech Stack

Project menggunakan:

```txt
Frontend  : Next.js App Router + TypeScript + Tailwind CSS
Backend   : Next.js Route Handler / Server Action
Database  : Supabase PostgreSQL
ORM       : Prisma
Auth      : Auth.js / NextAuth
Validation: Zod
QR Code   : qrcode
QR Scanner: html5-qrcode atau scanner library ringan lain
Location  : Browser Geolocation API
```

---

## Environment Variables

Minimal:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

AUTH_SECRET="generate-secret-here"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Suggested Folder Structure

Gunakan foldering berikut:

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
    layout/
    attendance/
    dashboard/

  lib/
    auth.ts
    prisma.ts
    distance.ts
    qr-token.ts
    constants.ts
    utils.ts
    validations/

  server/
    attendance/
    sessions/
    admin/

  types/

prisma/
  schema.prisma
  seed.ts
```

---

## Page Description

### `/login`

Halaman login untuk mahasiswa, dosen, dan admin.

UI:

- Nama aplikasi: POLIMDO GO
- Tagline: Presensi Mahasiswa Berbasis QR Code dan Lokasi
- Email/NIM
- Password
- Tombol login

---

### `/student/dashboard`

Dashboard mahasiswa.

Menampilkan:

- Sapaan mahasiswa
- NIM
- Program studi
- Kelas
- Jadwal hari ini
- Sesi presensi aktif
- Tombol "Scan QR Presensi"

---

### `/student/schedule`

Halaman jadwal mahasiswa.

Menampilkan:

- Mata kuliah
- Dosen
- Jam
- Ruangan
- Status: Belum Mulai, Aktif, Selesai

---

### `/student/attendance/scan`

Halaman scan QR.

Flow:

1. Kamera scanner aktif.
2. Mahasiswa scan QR.
3. Sistem meminta izin lokasi.
4. Mahasiswa klik kirim presensi.
5. Sistem mengirim token dan koordinat ke server.

---

### `/student/history`

Riwayat presensi mahasiswa.

Menampilkan:

- Mata kuliah
- Tanggal
- Jam
- Status
- Jarak jika tersedia
- Alasan gagal jika ditolak

---

### `/lecturer/dashboard`

Dashboard dosen.

Menampilkan:

- Jadwal hari ini
- Sesi presensi aktif
- Total hadir
- Tombol buat sesi presensi
- Tombol lihat rekap

---

### `/lecturer/sessions/new`

Form membuat sesi presensi.

Input:

- Mata kuliah
- Kelas
- Ruangan/lokasi
- Waktu mulai
- Waktu selesai
- Radius dalam meter
- Waktu expired QR

---

### `/lecturer/sessions/[id]/qr`

Halaman QR dosen.

Menampilkan:

- QR Code besar
- Mata kuliah
- Kelas
- Ruangan
- Radius
- Timer/expired time
- Tombol tutup sesi
- Tombol lihat kehadiran

---

### `/lecturer/sessions/[id]/records`

Halaman daftar kehadiran.

Menampilkan:

- Nama mahasiswa
- NIM
- Waktu presensi
- Jarak
- Status
- Alasan ditolak jika ada

---

### `/admin/dashboard`

Dashboard admin sederhana.

Menampilkan menu:

- Mahasiswa
- Dosen
- Mata Kuliah
- Kelas
- Ruangan
- Jadwal

---

## Data Model Concept

Minimal model:

```txt
User
StudentProfile
LecturerProfile
Course
Class
RoomLocation
Schedule
AttendanceSession
AttendanceRecord
```

### User

Menyimpan akun login.

Field penting:

- id
- name
- email
- passwordHash
- role
- createdAt
- updatedAt

### StudentProfile

Menyimpan profil mahasiswa.

Field penting:

- userId
- nim
- program
- classId

### LecturerProfile

Menyimpan profil dosen.

Field penting:

- userId
- nidn

### Course

Menyimpan mata kuliah.

Field penting:

- name
- code
- lecturerId

### Class

Menyimpan kelas.

Field penting:

- name
- program

### RoomLocation

Menyimpan lokasi ruangan/kampus.

Field penting:

- name
- latitude
- longitude
- defaultRadiusMeters

### Schedule

Menyimpan jadwal kuliah.

Field penting:

- courseId
- classId
- roomId
- dayOfWeek
- startTime
- endTime

### AttendanceSession

Menyimpan sesi presensi yang dibuat dosen.

Field penting:

- scheduleId
- lecturerId
- tokenHash
- tokenExpiresAt
- startAt
- endAt
- radiusMeters
- status

### AttendanceRecord

Menyimpan hasil presensi mahasiswa.

Field penting:

- sessionId
- studentId
- checkedInAt
- studentLatitude
- studentLongitude
- distanceMeters
- status
- rejectionReason

---

## UI Design Direction

Arah desain:

- Minimalis
- Clean
- Mobile-first
- Mudah dibaca
- Banyak whitespace
- Card-based layout
- Tailwind CSS
- Bahasa Indonesia

Warna:

```txt
Accent  : Indigo/Purple
Success : Green
Rejected: Red
Warning : Amber
Inactive: Gray
Background: Neutral light
Card: White
```

Jangan membuat UI terlalu ramai.

---

## Important UI Text

Gunakan teks berikut:

```txt
POLIMDO GO
Presensi Mahasiswa Berbasis QR Code dan Lokasi
Scan QR Presensi
Aktifkan Lokasi
Kirim Presensi
Presensi Berhasil
Presensi Ditolak
Kamu berada di luar radius presensi
QR Code sudah kedaluwarsa
Sesi presensi sudah ditutup
Buat Sesi Presensi
Tutup Sesi
Lihat Kehadiran
Kembali ke Beranda
Coba Lagi
```

---

## Demo Data Needed

Seed minimal:

- 1 admin
- 1 dosen
- 3 mahasiswa
- 1 mata kuliah
- 1 kelas
- 1 ruangan/lokasi
- 1 jadwal
- 1 sesi presensi demo jika dibutuhkan

---

## Testing Scenario

Scenario wajib:

### 1. Login

- Login sebagai admin
- Login sebagai dosen
- Login sebagai mahasiswa

### 2. Admin Setup

- Tambah ruangan/lokasi
- Tambah mata kuliah
- Tambah kelas
- Tambah jadwal

### 3. Dosen Membuat Sesi

- Dosen membuat sesi presensi
- Sistem generate QR Code
- QR Code tampil

### 4. Mahasiswa Presensi Valid

- Mahasiswa scan QR
- Mahasiswa izinkan lokasi
- Lokasi dalam radius
- Presensi valid

### 5. Mahasiswa di Luar Radius

- Mahasiswa scan QR
- Lokasi di luar radius
- Presensi ditolak
- Reason: OUT_OF_RADIUS

### 6. QR Expired

- Token expired
- Presensi ditolak
- Reason: QR_EXPIRED

### 7. Presensi Ganda

- Mahasiswa presensi dua kali
- Percobaan kedua ditolak
- Reason: ALREADY_ATTENDED

### 8. Sesi Ditutup

- Dosen tutup sesi
- Mahasiswa mencoba presensi
- Presensi ditolak
- Reason: SESSION_CLOSED

---

## Known Limitations

Sistem ini tidak boleh diklaim 100% anti-kecurangan.

Tuliskan limitasi:

- GPS browser bisa tidak akurat.
- Akurasi lokasi bergantung device dan sinyal.
- Lokasi indoor bisa kurang presisi.
- Mahasiswa bisa menolak izin lokasi.
- Radius validation adalah metode mitigasi, bukan jaminan absolut.
- Sistem bisa dikembangkan dengan QR dinamis, validasi Wi-Fi, device binding, atau face verification.

---

## Project Focus Reminder

POLIMDO GO harus tetap fokus pada:

```txt
Presensi QR Code
Geolocation
Radius Validation
Riwayat Presensi
Dashboard Dosen/Admin
```

Jangan melebar menjadi aplikasi kampus lengkap.
