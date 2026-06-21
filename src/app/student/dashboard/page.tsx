// LOG: [POLIMDO GO] Halaman Dashboard Mahasiswa dengan Toleransi Offline Fallback
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { QrCode, Calendar, Clock, MapPin, AlertCircle, FileText, CheckCircle } from 'lucide-react';

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  const studentName = session.user.name || 'Mahasiswa';
  const nim = session.user.nim || '-';
  
  let schedules: any[] = [];
  let activeSessions: any[] = [];
  let isDbOffline = false;
  let program = 'D4 Teknik Informatika';

  try {
    // Cari jadwal hari ini (contoh dayOfWeek 1-7, Jumat = 5)
    const today = new Date().getDay(); // 0 = Minggu, 5 = Jumat
    
    let studentProfile = null;
    if (session.user.id) {
      studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
        include: { class: true }
      });
    }

    if (!studentProfile && session.user.nim) {
      studentProfile = await prisma.studentProfile.findUnique({
        where: { nim: session.user.nim },
        include: { class: true }
      });
    }

    if (!studentProfile && session.user.email) {
      studentProfile = await prisma.studentProfile.findFirst({
        where: { user: { email: session.user.email } },
        include: { class: true }
      });
    }

    if (studentProfile) {
      program = studentProfile.program;
      
      if (studentProfile.classId) {
      schedules = await prisma.schedule.findMany({
        where: {
          classId: studentProfile.classId,
          dayOfWeek: today === 0 ? 7 : today // Sesuaikan dayOfWeek
        },
        include: {
          course: true,
          room: true
        }
      });

      // Cari sesi presensi aktif
      activeSessions = await prisma.attendanceSession.findMany({
        where: {
          schedule: { classId: studentProfile.classId },
          status: 'ACTIVE',
          tokenExpiresAt: { gt: new Date() }
        },
        include: {
          schedule: {
            include: {
              course: true,
              room: true
            }
          }
        }
      });
      }
    }
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data simulasi untuk mahasiswa.");
    
    // Mock data untuk mode offline/development
    schedules = [
      {
        id: 'mock-sched-1',
        course: { name: 'Pemrograman Berbasis Platform', code: 'TI4001' },
        room: { name: 'Lab RPL - Lt. 2 Elektro' },
        startTime: '08:00',
        endTime: '11:30'
      }
    ];

    activeSessions = [
      {
        id: 'mock-sess-1',
        radiusMeters: 50,
        schedule: {
          course: { name: 'Pemrograman Berbasis Platform', code: 'TI4001' },
          room: { name: 'Lab RPL - Lt. 2 Elektro' }
        }
      }
    ];
  }

  return (
    <AppShell role="STUDENT" title="Beranda Mahasiswa">
      <div className="max-w-4xl mx-auto space-y-6">
        


        {/* Profil Singkat */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md shadow-indigo-100 flex justify-between items-center gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Selamat Datang,</span>
            <h2 className="text-2xl font-bold mt-1">{studentName}</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 pt-4 border-t border-indigo-500/30 text-xs text-indigo-100">
              <div>
                <span className="text-indigo-200 font-medium block">NIM</span>
                <span className="font-bold text-sm">{nim}</span>
              </div>
              <div>
                <span className="text-indigo-200 font-medium block">Program Studi</span>
                <span className="font-bold text-sm">{program}</span>
              </div>
            </div>
          </div>
          {session?.user?.image && (
            <img 
              src={session.user.image} 
              alt={studentName} 
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-400/50 shadow-md shrink-0"
            />
          )}
        </div>

        {/* Tombol Presensi Cepat (Sesi Aktif) */}
        <div className="space-y-3">
          <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider text-zinc-500">Sesi Presensi Aktif</h3>
          {activeSessions.length > 0 ? (
            activeSessions.map((session) => (
              <div key={session.id} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Sesi Dibuka
                  </span>
                  <h4 className="font-bold text-zinc-900">{session.schedule.course.name}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Radius: {session.radiusMeters}m
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {session.schedule.room.name}
                    </span>
                  </div>
                </div>
                
                <Link
                  href="/student/attendance/scan"
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm w-full sm:w-auto justify-center"
                >
                  <QrCode size={18} />
                  Scan QR Presensi
                </Link>
              </div>
            ))
          ) : (
            <div className="bg-white border border-dashed border-zinc-300 rounded-xl p-8 text-center">
              <Clock size={32} className="text-zinc-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-800">Tidak ada sesi presensi aktif</p>
              <p className="text-xs text-zinc-400 mt-0.5">Sesi presensi akan muncul jika dosen telah mengaktifkan kelas.</p>
            </div>
          )}
        </div>

        {/* Jadwal Hari Ini */}
        <div className="space-y-3">
          <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider text-zinc-500">Jadwal Kuliah Hari Ini</h3>
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
                        {schedule.course.code}
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
              Tidak ada jadwal kuliah hari ini.
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
