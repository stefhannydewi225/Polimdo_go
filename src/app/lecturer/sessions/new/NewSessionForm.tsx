// LOG: [POLIMDO GO] Komponen Form Pembuatan Sesi Presensi Baru oleh Dosen
'use strict';

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSessionSchema } from '@/lib/validations/session';
import { AlertCircle, Loader2, Save } from 'lucide-react';

interface ScheduleItem {
  id: string;
  course: { name: string; code: string };
  class: { name: string };
  room: { name: string; defaultRadiusMeters: number };
  startTime: string;
  endTime: string;
}

interface NewSessionFormProps {
  schedules: ScheduleItem[];
  isOffline: boolean;
}

export default function NewSessionForm({ schedules, isOffline }: NewSessionFormProps) {
  const router = useRouter();

  const [scheduleId, setScheduleId] = useState('');
  const [radiusMeters, setRadiusMeters] = useState(50);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [qrExpiryMinutes, setQrExpiryMinutes] = useState(5);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'locked' | 'error' | 'not_requested'>('not_requested');

  React.useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      setGpsStatus('acquiring');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setGpsStatus('locked');
        },
        (error) => {
          console.warn("Gagal mendapatkan lokasi GPS Dosen:", error);
          setGpsStatus('error');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  // Otomatis ubah radius default ketika jadwal dipilih
  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setScheduleId(id);
    const selected = schedules.find(s => s.id === id);
    if (selected) {
      setRadiusMeters(selected.room.defaultRadiusMeters);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validasi input menggunakan Zod
    const validation = createSessionSchema.safeParse({
      scheduleId,
      radiusMeters,
      durationMinutes,
      qrExpiryMinutes
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId,
          radiusMeters,
          durationMinutes,
          qrExpiryMinutes,
          latitude: coords?.latitude || null,
          longitude: coords?.longitude || null
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Gagal membuat sesi presensi.');
        setIsLoading(false);
      } else {
        // Redirect ke halaman QR Code sesi yang baru dibuat
        router.push(`/lecturer/sessions/${data.sessionId}/qr?token=${data.token}`);
        router.refresh();
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi sistem.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* GPS Status Indicator */}
      <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
        gpsStatus === 'locked' 
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' 
          : gpsStatus === 'acquiring'
          ? 'bg-indigo-50/80 border-indigo-200 text-indigo-800'
          : 'bg-amber-50/80 border-amber-200 text-amber-800'
      }`}>
        <div className="flex items-start gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
            gpsStatus === 'locked' 
              ? 'bg-emerald-500 animate-pulse' 
              : gpsStatus === 'acquiring'
              ? 'bg-indigo-500 animate-ping'
              : 'bg-amber-500'
          }`} />
          <div>
            <span className="font-bold">
              {gpsStatus === 'locked' 
                ? 'Lokasi Dosen Terkunci (Presensi Dinamis)' 
                : gpsStatus === 'acquiring'
                ? 'Mencari Sinyal GPS...'
                : 'GPS Nonaktif / Izin Ditolak'}
            </span>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              {gpsStatus === 'locked' 
                ? `Posisi Dosen: ${coords?.latitude.toFixed(6)}, ${coords?.longitude.toFixed(6)}. Presensi mahasiswa akan divalidasi terhadap lokasi Anda saat ini.` 
                : gpsStatus === 'acquiring'
                ? 'Mengunci posisi GPS perangkat untuk mengaktifkan presensi dinamis...'
                : 'Menggunakan koordinat default ruangan kelas di database.'}
            </p>
          </div>
        </div>
        
        {gpsStatus === 'error' && (
          <button 
            type="button"
            onClick={() => {
              setGpsStatus('acquiring');
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                  setGpsStatus('locked');
                },
                () => setGpsStatus('error'),
                { enableHighAccuracy: true }
              );
            }}
            className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg font-bold text-[9px] text-amber-700 transition-colors shrink-0"
          >
            Coba Lagi
          </button>
        )}
      </div>

      {/* Pilihan Jadwal */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
          Jadwal Mata Kuliah / Kelas
        </label>
        {schedules.length === 0 && (
          <div className="mb-3 p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex gap-2">
            <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold">Jadwal Kuliah Belum Dibuat oleh Admin</span>
              <p className="mt-1 leading-relaxed text-zinc-600">
                Meskipun data Mata Kuliah sudah terdaftar di admin, Anda harus membuat **Jadwal Kuliah (Schedules)** terlebih dahulu untuk menghubungkan Mata Kuliah tersebut dengan Kelas dan Ruangan Kelas (agar koordinat GPS kelas terekam).
              </p>
              <p className="mt-1.5 font-bold">
                Langkah Solusi: Silakan masuk ke akun Admin (admin@presensigo.com), lalu masuk ke menu &quot;Kelola Jadwal&quot; dan tambahkan Jadwal Baru.
              </p>
            </div>
          </div>
        )}
        <select
          required
          value={scheduleId}
          onChange={handleScheduleChange}
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-800"
          disabled={schedules.length === 0}
        >
          {schedules.length === 0 ? (
            <option value="">-- Tidak ada jadwal kuliah yang tersedia --</option>
          ) : (
            <option value="">-- Pilih Jadwal Kelas Anda --</option>
          )}
          {schedules.map((s) => (
            <option key={s.id} value={s.id}>
              {s.course.name} ({s.class.name}) - {s.room.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Radius Toleransi */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
            Radius Validasi (Meter)
          </label>
          <input
            type="number"
            required
            min={5}
            max={1000}
            value={radiusMeters}
            onChange={(e) => setRadiusMeters(Number(e.target.value))}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-[10px] text-zinc-400 mt-1">Jarak toleransi GPS mahasiswa.</p>
        </div>

        {/* Durasi Sesi */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
            Durasi Kelas (Menit)
          </label>
          <input
            type="number"
            required
            min={5}
            max={360}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-[10px] text-zinc-400 mt-1">Sesi ditutup otomatis setelah batas.</p>
        </div>

        {/* Expiry Token QR */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
            Kedaluwarsa QR (Menit)
          </label>
          <input
            type="number"
            required
            min={1}
            max={60}
            value={qrExpiryMinutes}
            onChange={(e) => setQrExpiryMinutes(Number(e.target.value))}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-[10px] text-zinc-400 mt-1">Batas waktu scan QR Code mahasiswa.</p>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || !scheduleId}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm shadow-emerald-100"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Menyimpan Sesi...
            </>
          ) : (
            <>
              <Save size={16} />
              Aktifkan Sesi & Buat QR
            </>
          )}
        </button>
      </div>
    </form>
  );
}
