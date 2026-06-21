// LOG: [POLIMDO GO] Halaman Jadwal Kuliah Mahasiswa dengan Toleransi Offline Fallback
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import { Calendar, Clock, MapPin, AlertCircle, User, Award } from 'lucide-react';
import Link from 'next/link';

export default async function StudentSchedulePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  let schedules: any[] = [];
  let className = 'Kelas Belum Ditentukan';
  let isDbOffline = false;

  const getDayName = (day: number) => {
    switch (day) {
      case 1: return 'Senin';
      case 2: return 'Selasa';
      case 3: return 'Rabu';
      case 4: return 'Kamis';
      case 5: return 'Jumat';
      case 6: return 'Sabtu';
      case 7: return 'Minggu';
      default: return 'Hari';
    }
  };

  try {
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

    if (studentProfile && studentProfile.classId) {
      className = studentProfile.class?.name || 'Kelas';
      
      const dbSchedules = await prisma.schedule.findMany({
        where: { classId: studentProfile.classId },
        include: {
          course: {
            include: {
              lecturer: {
                include: { user: true }
              }
            }
          },
          room: true
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' }
        ]
      });

      schedules = dbSchedules.map(s => ({
        id: s.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        courseName: s.course.name,
        courseCode: s.course.code,
        roomName: s.room.name,
        lecturerName: s.course.lecturer?.user.name || '-'
      }));
    }
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data jadwal kuliah simulasi.");
    className = "TI 4-A (Mode Simulasi)";
    schedules = [
      {
        id: 'mock-1',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '10:30',
        courseName: 'Basis Data Lanjut',
        courseCode: 'TI4002',
        roomName: 'Lab RPL - Lt. 2 Elektro',
        lecturerName: 'Drs. Dosen Elektro Lain, M.Kom.'
      },
      {
        id: 'mock-2',
        dayOfWeek: 2,
        startTime: '08:00',
        endTime: '11:30',
        courseName: 'Jaringan Komputer',
        courseCode: 'TI4003',
        roomName: 'Lab Jaringan - Lt. 1 Elektro',
        lecturerName: 'Dr. Ir. Dosen Elektro, M.T.'
      },
      {
        id: 'mock-3',
        dayOfWeek: 5,
        startTime: '08:00',
        endTime: '11:30',
        courseName: 'Pemrograman Berbasis Platform',
        courseCode: 'TI4001',
        roomName: 'Lab RPL - Lt. 2 Elektro',
        lecturerName: 'Dr. Ir. Dosen Elektro, M.T.'
      }
    ];
  }

  // Pengelompokan berdasarkan hari
  const days = [1, 2, 3, 4, 5, 6, 7];

  return (
    <AppShell role="STUDENT" title="Jadwal Kuliah">
      <div className="max-w-4xl mx-auto space-y-6">
        


        {/* Judul Halaman */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Jadwal Kuliah Mingguan</h2>
            <p className="text-xs text-zinc-500">Daftar kelas perkuliahan Anda yang terdaftar pada semester ini.</p>
          </div>
          <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl self-start sm:self-auto">
            Kelas: {className}
          </span>
        </div>

        {/* List Jadwal Per Hari */}
        <div className="space-y-6">
          {days.map((day) => {
            const daySchedules = schedules.filter(s => s.dayOfWeek === day);

            return (
              <div key={day} className="space-y-2">
                <h3 className="font-bold text-zinc-800 text-xs uppercase tracking-wider border-b border-zinc-200 pb-1.5">
                  Hari {getDayName(day)}
                </h3>
                
                {daySchedules.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {daySchedules.map((schedule) => (
                      <div key={schedule.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-zinc-950 text-sm leading-snug">{schedule.courseName}</h4>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded-md font-mono shrink-0">
                              {schedule.courseCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                            <User size={13} className="text-zinc-400" />
                            {schedule.lecturerName}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100 text-[10px] text-zinc-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-indigo-600" />
                            {schedule.startTime} - {schedule.endTime} WITA
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-indigo-600" />
                            {schedule.roomName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-xs italic py-2 pl-1">Tidak ada jadwal perkuliahan.</p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </AppShell>
  );
}
