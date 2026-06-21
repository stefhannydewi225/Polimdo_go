// LOG: [POLIMDO GO] Halaman Pemindaian QR Code & Pengambilan Geolocation GPS - Fitur Kode Manual
'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { QrCode, MapPin, Loader2, AlertCircle, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Import scanner secara dinamis agar tidak error window is not defined saat build SSR
const QrScanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 bg-zinc-100 flex items-center justify-center rounded-xl border border-zinc-200">
        <Loader2 className="animate-spin text-indigo-600" size={24} />
      </div>
    )
  }
);

function ScanAttendanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ambil token dari query string (jika mahasiswa men-scan lewat kamera bawaan hp dan masuk link langsung)
  const tokenFromUrl = searchParams.get('token');

  const [token, setToken] = useState<string>('');
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    success: boolean;
    status: 'VALID' | 'REJECTED';
    message: string;
    distanceMeters?: number;
    reason?: string;
  } | null>(null);

  // Jalankan pengambilan lokasi saat halaman dimuat
  useEffect(() => {
    requestLocation();
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setIsScanning(false);
    }
  }, [tokenFromUrl]);

  const requestLocation = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Browser Anda tidak mendukung layanan Geolocation.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error(error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Izin lokasi ditolak. Aktifkan izin lokasi di browser Anda.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('Informasi lokasi GPS tidak tersedia.');
            break;
          case error.TIMEOUT:
            setGpsError('Waktu pengambilan lokasi habis.');
            break;
          default:
            setGpsError('Gagal mendeteksi lokasi GPS.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleScan = (text: string) => {
    if (!text) return;
    
    // QR Code bisa berupa link: https://domain.com/student/attendance/scan?token=RANDOM
    // atau sekadar token mentah: RANDOM
    let extractedToken = text;
    try {
      if (text.includes('token=')) {
        const url = new URL(text);
        extractedToken = url.searchParams.get('token') || text;
      }
    } catch (e) {
      // bukan url, gunakan text asli
    }

    setToken(extractedToken);
    setIsScanning(false);
  };

  const submitAttendance = async () => {
    if (!token) return;
    if (!gpsLocation) {
      setGpsError('Lokasi GPS belum didapatkan. Silakan klik ambil ulang lokasi.');
      return;
    }

    setIsSubmitting(true);
    setStatusResult(null);

    try {
      const res = await fetch('/api/attendance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
        }),
      });

      const data = await res.json();
      setStatusResult(data);
    } catch (err) {
      setStatusResult({
        success: false,
        status: 'REJECTED',
        message: 'Gagal menghubungi server.',
        reason: 'CONNECTION_FAILED',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Otomatis kirim jika token dari URL & GPS sudah siap
  useEffect(() => {
    if (token && gpsLocation && !statusResult && !isSubmitting && tokenFromUrl) {
      submitAttendance();
    }
  }, [token, gpsLocation]);

  return (
    <AppShell role="STUDENT" title="Scan QR Presensi">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Tombol Kembali */}
        <Link href="/student/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950">
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>

        {/* Status GPS */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status Koordinat GPS</h3>
            <button
              onClick={requestLocation}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
            >
              Ambil Ulang Lokasi
            </button>
          </div>

          {gpsLocation ? (
            <div className="flex items-center gap-2.5 text-xs text-green-700 bg-green-50 p-2.5 border border-green-200 rounded-lg">
              <MapPin size={16} />
              <div>
                <p className="font-bold">Lokasi Didapatkan</p>
                <p className="text-[10px] text-green-600 font-medium">Lat: {gpsLocation.latitude.toFixed(6)}, Long: {gpsLocation.longitude.toFixed(6)}</p>
              </div>
            </div>
          ) : gpsError ? (
            <div className="flex items-center gap-2.5 text-xs text-red-700 bg-red-50 p-2.5 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="shrink-0" />
              <p className="font-bold">{gpsError}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-xs text-zinc-500 bg-zinc-50 p-2.5 border border-zinc-200 rounded-lg">
              <Loader2 size={16} className="animate-spin text-zinc-400" />
              <p>Sedang mendeteksi lokasi GPS...</p>
            </div>
          )}
        </div>

        {/* Hasil Presensi */}
        {statusResult && (
          <div className={`border rounded-xl p-5 shadow-sm text-center space-y-4 bg-white ${
            statusResult.status === 'VALID' ? 'border-green-200' : 'border-red-200'
          }`}>
            <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
              {statusResult.status === 'VALID' ? (
                <CheckCircle2 size={48} className="text-green-600" />
              ) : (
                <XCircle size={48} className="text-red-600" />
              )}
            </div>

            <div>
              <h3 className={`text-lg font-bold ${
                statusResult.status === 'VALID' ? 'text-green-800' : 'text-red-800'
              }`}>
                {statusResult.status === 'VALID' ? 'Presensi Berhasil' : 'Presensi Ditolak'}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{statusResult.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs py-3 border-t border-b border-zinc-100">
              <div className="text-left">
                <span className="text-zinc-400 block">Jarak Anda</span>
                <span className="font-bold text-zinc-800">
                  {statusResult.distanceMeters !== undefined ? `${statusResult.distanceMeters} meter` : '-'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-zinc-400 block">Status Validasi</span>
                <span className={`font-bold ${statusResult.status === 'VALID' ? 'text-green-600' : 'text-red-600'}`}>
                  {statusResult.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStatusResult(null);
                  setToken('');
                  setManualCodeInput('');
                  setIsScanning(true);
                }}
                className="flex-1 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Scan Ulang
              </button>
              <Link
                href="/student/dashboard"
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold text-center transition-colors"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        )}

        {/* Bagian Scanner */}
        {!statusResult && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            
            {isScanning ? (
              isManualMode ? (
                <div className="w-full space-y-4">
                  <div>
                    <h3 className="font-bold text-zinc-800 text-base">Input Kode Manual</h3>
                    <p className="text-xs text-zinc-400">Masukkan 6 digit kode yang tertera di layar dosen.</p>
                  </div>

                  <div className="w-full max-w-[240px] mx-auto space-y-3">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="------"
                      value={manualCodeInput}
                      onChange={(e) => setManualCodeInput(e.target.value.replace(/\D/g, '').substring(0, 6))}
                      className="w-full text-center tracking-[0.25em] text-2xl font-mono font-extrabold px-3 py-3 border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-800 shadow-inner"
                    />

                    <button
                      onClick={() => {
                        if (manualCodeInput.length === 6) {
                          handleScan(manualCodeInput);
                        }
                      }}
                      disabled={manualCodeInput.length !== 6}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center"
                    >
                      Konfirmasi Kode
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  <div>
                    <h3 className="font-bold text-zinc-800 text-base">Arahkan Kamera ke QR Code</h3>
                    <p className="text-xs text-zinc-400">Posisikan kode di dalam area pemindaian.</p>
                  </div>
                  
                  {/* QR Scanner Container */}
                  <div className="overflow-hidden rounded-xl w-full max-w-[280px] mx-auto aspect-square border border-zinc-200 shadow-inner">
                    <QrScanner
                      onScan={(detected) => {
                        if (detected && detected.length > 0) {
                          handleScan(detected[0].rawValue);
                        }
                      }}
                      onError={(err) => console.error(err)}
                    />
                  </div>
                </div>
              )
            ) : (
              <div className="w-full space-y-4">
                <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-center flex flex-col items-center gap-1">
                  <QrCode size={24} />
                  <div>
                    <p className="text-xs font-bold">{/^\d{6}$/.test(token) ? 'Kode Manual Terdeteksi' : 'QR Token Terdeteksi'}</p>
                    <p className="text-[10px] font-mono truncate max-w-[220px]">{token}</p>
                  </div>
                </div>

                <button
                  onClick={submitAttendance}
                  disabled={isSubmitting || !gpsLocation}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Mengirim Presensi...
                    </>
                  ) : (
                    <>
                      Kirim Presensi
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setToken('');
                    setManualCodeInput('');
                    setIsScanning(true);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-800 block mx-auto underline animate-pulse"
                >
                  Batal & Scan / Input Ulang
                </button>
              </div>
            )}

            {/* Toggle Mode Scan / Manual */}
            {isScanning && (
              <div className="pt-3 border-t border-zinc-100 w-full">
                <button
                  onClick={() => {
                    setIsManualMode(!isManualMode);
                    setManualCodeInput('');
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-800 font-semibold transition-colors"
                >
                  {isManualMode ? 'Gunakan Kamera Pemindai' : 'Kamera Bermasalah? Input Kode Manual'}
                </button>
              </div>
            )}
            
          </div>
        )}

      </div>
    </AppShell>
  );
}

export default function ScanAttendancePage() {
  return (
    <React.Suspense fallback={
      <div className="flex-1 flex flex-col justify-center items-center min-h-screen bg-[#f8f9ff]">
        <Loader2 className="animate-spin text-indigo-600 mx-auto" size={36} />
        <p className="text-sm font-semibold text-zinc-500">Memuat pemindai...</p>
      </div>
    }>
      <ScanAttendanceContent />
    </React.Suspense>
  );
}
