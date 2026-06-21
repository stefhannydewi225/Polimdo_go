// LOG: [POLIMDO GO] Halaman Tampilan QR Code Sesi Presensi Dosen - Tampilkan Kode Manual
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import QRCode from 'qrcode';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, AlertCircle, Users, XCircle } from 'lucide-react';

interface QrPageProps {
  params: Promise<{ id: string }> | { id: string };
  searchParams: Promise<{ token?: string }> | { token?: string };
}

export default async function LecturerSessionQrPage({ params, searchParams }: QrPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'LECTURER') {
    redirect('/login');
  }

  // Resolve async params in Next.js 15
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const sessionId = resolvedParams.id;
  const plainToken = resolvedSearchParams.token || 'mock-token-demo';

  let sessionDetails: any = null;
  let isDbOffline = false;

  try {
    sessionDetails = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        schedule: {
          include: {
            course: true,
            class: true,
            room: true
          }
        }
      }
    });
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data simulasi sesi untuk QR Code.");
  }

  // Fallback data simulasi jika DB offline atau data tidak ditemukan
  if (!sessionDetails) {
    sessionDetails = {
      id: sessionId,
      radiusMeters: 50,
      tokenExpiresAt: new Date(Date.now() + 1800000), // 30 menit lagi
      status: 'ACTIVE',
      passcode: '123456',
      schedule: {
        course: { name: 'Pemrograman Berbasis Platform', code: 'TI4001' },
        class: { name: 'TI 4-A' },
        room: { name: 'Lab RPL - Lt. 2 Elektro' }
      }
    };
  }

  // Buat URL scan presensi untuk disematkan di QR Code
  // Menggunakan passcode (6 digit) agar QR Code tetap bisa digenerate dari history list tanpa token mentah
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const tokenForQr = sessionDetails.passcode || plainToken;
  const scanUrl = `${appUrl}/student/attendance/scan?token=${tokenForQr}`;

  // Generate QR Code data URL (base64 image) server-side
  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(scanUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a', // zinc-900
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Gagal membuat QR Code image:', err);
  }

  // Hitung durasi kedaluwarsa QR Code
  const expiryTime = new Date(sessionDetails.tokenExpiresAt).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <AppShell role="LECTURER" title="QR Code Sesi Presensi">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Tombol Navigasi */}
        <div className="flex justify-between items-center">
          <Link href="/lecturer/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950">
            <ArrowLeft size={14} />
            Kembali ke Beranda
          </Link>
          <Link
            href={`/lecturer/sessions/${sessionId}/records`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <Users size={14} />
            Lihat Kehadiran Kelas
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Sisi Kiri - Detail Kelas */}
          <div className="md:col-span-5 bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-full uppercase tracking-wider">
                  Detail Kelas Aktif
                </span>
                <h3 className="text-xl font-bold text-zinc-900 mt-3">{sessionDetails.schedule.course.name}</h3>
                <p className="text-xs text-zinc-400 font-medium">Mata Kuliah: {sessionDetails.schedule.course.code}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-100 text-xs text-zinc-600">
                <p className="flex items-center gap-2">
                  <Users size={16} className="text-indigo-600 shrink-0" />
                  <span>Kelas: <strong>{sessionDetails.schedule.class.name}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={16} className="text-indigo-600 shrink-0" />
                  <span>Ruangan: <strong>{sessionDetails.schedule.room.name}</strong></span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={16} className="text-indigo-600 shrink-0" />
                  <span>QR Expired: <strong className="text-red-600">{expiryTime} WITA</strong></span>
                </p>
              </div>
            </div>

            {/* Action Sesi */}
            <div className="pt-6 border-t border-zinc-100 mt-6 md:mt-0">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] text-indigo-800 leading-relaxed">
                <strong>Petunjuk:</strong> Minta mahasiswa membuka aplikasi <strong>POLIMDO GO</strong>, masuk ke menu <strong>Presensi</strong>, dan scan QR Code di samping.
              </div>
            </div>
          </div>

          {/* Sisi Kanan - QR Code Display */}
          <div className="md:col-span-7 bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
            {qrCodeDataUrl ? (
              <div className="space-y-5 w-full">
                {/* Frame QR Code */}
                <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl shadow-inner max-w-max mx-auto">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code Presensi"
                    className="w-64 h-64 md:w-80 md:h-80"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-800">Scan QR Code</h4>
                  <p className="text-[10px] text-zinc-400 font-mono select-all truncate max-w-[280px] mx-auto mt-1">
                    {scanUrl}
                  </p>
                </div>
                <div className="pt-3 border-t border-zinc-100 w-full">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Kamera Bermasalah? Kode Manual Mahasiswa</span>
                  <div className="mt-1.5 flex items-center justify-center">
                    <span className="px-5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-extrabold text-2xl rounded-xl tracking-[0.2em] shadow-sm select-all">
                      {sessionDetails.passcode || '123456'}
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-400 mt-1">Mahasiswa dapat memasukkan 6 digit kode di atas secara manual.</p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center space-y-2">
                <XCircle size={36} className="text-red-500 mx-auto" />
                <p className="text-sm font-bold text-zinc-800">QR Code Gagal Digenerate</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </AppShell>
  );
}
