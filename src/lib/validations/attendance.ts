import { z } from 'zod';

/**
 * Schema validasi untuk request submit kehadiran mahasiswa.
 * Kompatibel dengan Zod 3 dan Zod 4.
 */
export const submitAttendanceSchema = z.object({
  token: z.string().min(1, 'Token presensi tidak boleh kosong'),
  latitude: z.coerce.number({
    error: 'Koordinat lokasi (latitude) wajib berupa angka',
  }),
  longitude: z.coerce.number({
    error: 'Koordinat lokasi (longitude) wajib berupa angka',
  }),
});

export type SubmitAttendanceInput = z.infer<typeof submitAttendanceSchema>;
