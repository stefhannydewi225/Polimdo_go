# PROMPT_AWAL.md
# Prompt Awal untuk AI Agent / Antigravity

Gunakan prompt ini saat mulai pengerjaan project POLIMDO GO.

---

## Prompt Awal

Baca dan pahami file berikut terlebih dahulu:

1. `AGENTS.md`
2. `AI_CONTEXT.md`

Project ini bernama **POLIMDO GO**.

POLIMDO GO adalah aplikasi web MVP untuk skripsi:

**Pengembangan Sistem Presensi Mahasiswa Berbasis QR Code dan Geolocation Menggunakan Metode Radius Validation untuk Mencegah Kecurangan Kehadiran pada Politeknik Negeri Manado**

Tech stack wajib:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Prisma ORM
- Auth.js / NextAuth
- Zod
- QR Code generator
- QR Code scanner
- Browser Geolocation API

Project ini menggunakan skill Ponytail:

https://github.com/DietrichGebert/ponytail

Ikuti aturan Ponytail jika tersedia di repo, tetapi jangan keluar dari scope project POLIMDO GO.

---

## Tugas Awal

Tolong kerjakan fondasi awal project secara rapi dan bertahap.

Prioritas tahap awal:

1. Cek struktur project yang ada.
2. Pastikan Next.js App Router + TypeScript + Tailwind berjalan.
3. Buat struktur folder sesuai `AI_CONTEXT.md`.
4. Setup Prisma.
5. Siapkan schema database awal untuk:
   - User
   - StudentProfile
   - LecturerProfile
   - Course
   - Class
   - RoomLocation
   - Schedule
   - AttendanceSession
   - AttendanceRecord
6. Setup Prisma client singleton di `src/lib/prisma.ts`.
7. Buat utility:
   - `src/lib/distance.ts` untuk Haversine formula
   - `src/lib/qr-token.ts` untuk generate/hash/compare token
   - `src/lib/validations/attendance.ts`
   - `src/lib/validations/session.ts`
8. Buat seed data demo minimal:
   - 1 admin
   - 1 dosen
   - 3 mahasiswa
   - 1 mata kuliah
   - 1 kelas
   - 1 ruangan/lokasi
   - 1 jadwal
9. Buat layout UI dasar minimalis dengan Tailwind.
10. Jangan implementasi semua fitur sekaligus.

---

## Aturan Penting

Jangan keluar dari scope MVP.

Jangan membuat fitur:

- Payment
- Chat
- Forum
- E-learning
- Upload tugas
- Marketplace
- Perpustakaan
- Face recognition
- Fingerprint
- GPS tracking real-time
- Mobile native app
- Microservices
- Super app akademik

Fokus hanya pada:

- QR Code attendance
- Geolocation
- Radius Validation
- Attendance Record
- Dashboard mahasiswa
- Dashboard dosen
- Dashboard admin

---

## Coding Rules

Wajib:

- Gunakan TypeScript.
- Gunakan Tailwind CSS.
- Gunakan Prisma untuk database.
- Jangan query database dari client component.
- Jangan expose `DATABASE_URL`.
- Jangan commit `.env`.
- Jangan hardcode secret.
- Validasi input dengan Zod.
- Validasi role server-side.
- Radius validation wajib di server.
- QR token wajib divalidasi di server.
- Cegah mahasiswa presensi dua kali dalam sesi yang sama.

---

## UI Direction

Buat desain:

- Minimalis
- Clean
- Mudah dibaca
- Mobile-first
- Banyak whitespace
- Card layout
- Bahasa Indonesia
- Tailwind friendly

Gunakan nama aplikasi:

```txt
POLIMDO GO
```

Gunakan tagline:

```txt
Presensi Mahasiswa Berbasis QR Code dan Lokasi
```

---

## Output Setelah Selesai

Setelah selesai patch/coding, laporkan dengan format:

```md
Selesai.

1. Files changed
- ...

2. Fitur/fondasi yang dibuat
- ...

3. Validasi/security
- ...

4. Cara test
- ...

5. Catatan/limitasi
- ...
```

Jangan terlalu panjang. Fokus ke hasil.

---

## Tahap Ini Jangan Dulu

Pada tahap awal ini jangan dulu:

- Integrasi QR scanner penuh
- Integrasi geolocation penuh
- Membuat semua dashboard final
- Membuat export Excel/PDF
- Membuat fitur besar tambahan

Buat fondasi yang rapi dulu agar tahap berikutnya mudah.
