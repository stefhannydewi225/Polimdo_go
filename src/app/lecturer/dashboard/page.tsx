// LOG: [POLIMDO GO] Halaman Dashboard Dosen dengan Toleransi Offline Fallback
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ClipboardList, PlusCircle, Clock, MapPin, AlertCircle, Users, Calendar } from 'lucide-react';

export default async function LecturerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'LECTURER') {
    redirect('/login');
  }

  const lecturerName = session.user.name || 'Dosen';
  const nip = session.user.nip || '-';
  
  let schedules: any[] = [];
  let activeSessions: any[] = [];
  let isDbOffline = false;

  try {
    const today = new Date().getDay();
    let lecturerProfile = null;
    if (session.user.id) {
      lecturerProfile = await prisma.lecturerProfile.findUnique({
        where: { userId: session.user.id }
      });
    }

    if (!lecturerProfile && session.user.nip) {
      lecturerProfile = await prisma.lecturerProfile.findUnique({
        where: { nip: session.user.nip }
      });
    }

    if (!lecturerProfile && session.user.email) {
      lecturerProfile = await prisma.lecturerProfile.findFirst({
        where: { user: { email: session.user.email } }
      });
    }

    if (lecturerProfile) {
      schedules = await prisma.schedule.findMany({
        where: {
          course: { lecturerId: lecturerProfile.id },
          dayOfWeek: today === 0 ? 7 : today
        },
        include: {
          course: true,
          class: true,
          room: true
        }
      });

      activeSessions = await prisma.attendanceSession.findMany({
        where: {
          lecturerId: lecturerProfile.id,
          status: 'ACTIVE'
        },
        include: {
          schedule: {
            include: {
              course: true,
              class: true,
              room: true
            }
          },
          _count: {
            select: { records: { where: { status: 'VALID' } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data simulasi untuk dosen.");
    schedules = [
      {
        id: 'mock-sched-1',
        course: { name: 'Pemrograman Berbasis Platform', code: 'TI4001' },
        class: { name: 'TI 4-A' },
        room: { name: 'Lab RPL - Lt. 2 Elektro' },
        startTime: '08:00',
        endTime: '11:30'
      }
    ];

    activeSessions = [
      {
        id: 'mock-sess-1',
        radiusMeters: 50,
        tokenExpiresAt: new Date(Date.now() + 1800000), // 30 menit lagi
        status: 'ACTIVE',
        schedule: {
          course: { name: 'Pemrograman Berbasis Platform', code: 'TI4001' },
          class: { name: 'TI 4-A' },
          room: { name: 'Lab RPL - Lt. 2 Elektro' }
        },
        _count: {
          records: 2 // 2 mhs hadir
        }
      }
    ];
  }

  return (
    <AppShell role="LECTURER" title="Beranda Dosen">
      <div className="max-w-4xl mx-auto space-y-6">
        


        {/* Profil Singkat */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl p-6 shadow-md shadow-emerald-100 flex justify-between items-center gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Selamat Datang, Dosen</span>
            <h2 className="text-2xl font-bold mt-1">{lecturerName}</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 pt-4 border-t border-emerald-500/30 text-xs text-emerald-100">
              <div>
                <span className="text-emerald-200 font-medium block">NIP</span>
                <span className="font-bold text-sm">{nip}</span>
              </div>
              <div>
                <span className="text-emerald-200 font-medium block">Jurusan</span>
                <span className="font-bold text-sm">Teknik Elektro</span>
              </div>
            </div>
          </div>
          {session?.user?.image && (
            <img 
              src={session.user.image} 
              alt={lecturerName} 
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400/50 shadow-md shrink-0"
            />
          )}
        </div>

        {/* Quick Action */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/lecturer/sessions/new"
            className="flex-1 flex items-center justify-center gap-2 p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-100"
          >
            <PlusCircle size={20} />
            Mulai Sesi Presensi Baru
          </Link>
          <Link
            href="/lecturer/sessions"
            className="flex-1 flex items-center justify-center gap-2 p-4 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <ClipboardList size={20} />
            Riwayat Sesi Presensi
          </Link>
        </div>

        {/* Sesi Presensi Aktif */}
        <div className="space-y-3">
          <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider text-zinc-500">Sesi Presensi Aktif</h3>
          {activeSessions.length > 0 ? (
            activeSessions.map((session) => (
              <div key={session.id} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      QR Aktif
                    </span>
                    <h4 className="font-bold text-zinc-900 text-base">{session.schedule.course.name}</h4>
                    <p className="text-xs text-zinc-500">Kelas: {session.schedule.class.name} | Ruang: {session.schedule.room.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
                    <Users size={16} className="text-indigo-600" />
                    <span>Hadir: <strong className="text-zinc-800 font-bold">{session._count?.records ?? 0}</strong> Mahasiswa</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100">
                  <Link
                    href={`/lecturer/sessions/${session.id}/qr`}
                    className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg text-center transition-colors"
                  >
                    Tampilkan QR Code
                  </Link>
                  <Link
                    href={`/lecturer/sessions/${session.id}/records`}
                    className="flex-1 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg text-center transition-colors"
                  >
                    Lihat Daftar Hadir
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-dashed border-zinc-300 rounded-xl p-8 text-center">
              <ClipboardList size={32} className="text-zinc-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-800">Tidak ada sesi aktif</p>
              <p className="text-xs text-zinc-400 mt-0.5">Silakan buat sesi baru untuk menampilkan QR Code ke mahasiswa.</p>
            </div>
          )}
        </div>

        {/* Jadwal Kuliah Hari Ini */}
        <div className="space-y-3">
          <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider text-zinc-500">Jadwal Mengajar Hari Ini</h3>
          {schedules.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="bg-white border border-zinc-200 rounded-xl p-4 flex gap-4">
                  <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-600 flex items-center justify-center shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-zinc-900 text-sm truncate">{schedule.course.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 rounded-full text-zinc-600 uppercase">
                        Kelas {schedule.class.name}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock size={12} />
                      {schedule.startTime} - {schedule.endTime} WITA
                    </p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <MapPin size={12} />
                      {schedule.room.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 text-center text-zinc-500 text-xs">
              Tidak ada jadwal mengajar hari ini.
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
