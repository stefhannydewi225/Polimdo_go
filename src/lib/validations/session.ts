import { z } from 'zod';

/**
 * Schema validasi untuk pembuatan sesi presensi baru oleh Dosen.
 * Kompatibel dengan Zod 3 dan Zod 4.
 */
export const createSessionSchema = z.object({
  scheduleId: z.string().min(1, 'Jadwal kuliah wajib dipilih'),
  radiusMeters: z.coerce.number().min(5, 'Radius minimal adalah 5 meter').max(1000, 'Radius maksimal adalah 1000 meter'),
  durationMinutes: z.coerce.number().min(5, 'Durasi sesi minimal 5 menit').max(360, 'Durasi sesi maksimal 360 menit'),
  qrExpiryMinutes: z.coerce.number().min(1, 'Masa berlaku QR minimal 1 menit').max(60, 'Masa berlaku QR maksimal 60 menit'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
