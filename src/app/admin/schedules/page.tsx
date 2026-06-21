// LOG: [POLIMDO GO] Halaman Kelola Jadwal Kuliah Admin dengan Toleransi Offline Fallback
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import SchedulesManager from './SchedulesManager';

export default async function AdminSchedulesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  let schedules: any[] = [];
  let courses: any[] = [];
  let classes: any[] = [];
  let rooms: any[] = [];
  let isDbOffline = false;

  try {
    const dbSchedules = await prisma.schedule.findMany({
      include: {
        course: {
          include: {
            lecturer: { include: { user: true } }
          }
        },
        class: true,
        room: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });
    schedules = dbSchedules.map(s => ({
      id: s.id,
      courseId: s.courseId,
      classId: s.classId,
      roomId: s.roomId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      courseName: s.course.name,
      className: s.class.name,
      roomName: s.room.name,
      lecturerName: s.course.lecturer?.user.name || '-'
    }));

    courses = await prisma.course.findMany({ orderBy: { code: 'asc' } });
    classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });
    const dbRooms = await prisma.roomLocation.findMany({ orderBy: { name: 'asc' } });
    rooms = dbRooms.map(r => ({
      id: r.id,
      name: r.name,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      defaultRadiusMeters: r.defaultRadiusMeters
    }));
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data jadwal kuliah simulasi.");
    schedules = [
      {
        id: '1',
        courseId: '1',
        classId: '1',
        roomId: '1',
        dayOfWeek: 5,
        startTime: '08:00',
        endTime: '11:30',
        courseName: 'Pemrograman Berbasis Platform',
        className: 'TI 4-A',
        roomName: 'Lab RPL - Lt. 2 Elektro',
        lecturerName: 'Dr. Ir. Dosen Elektro, M.T.'
      }
    ];
    courses = [
      { id: '1', code: 'TI4001', name: 'Pemrograman Berbasis Platform' }
    ];
    classes = [
      { id: '1', name: 'TI 4-A' }
    ];
    rooms = [
      { id: '1', name: 'Lab RPL - Lt. 2 Elektro' }
    ];
  }


  return (
    <AppShell role="ADMIN" title="Kelola Jadwal Kuliah">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Tombol Kembali */}
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950">
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>

        {/* Judul */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Kelola Jadwal Kuliah</h2>
          <p className="text-xs text-zinc-500">Tambah, lihat, dan hapus jadwal perkuliahan mingguan yang aktif.</p>
        </div>

        {/* Manager Component (CRUD) */}
        <SchedulesManager
          initialSchedules={schedules}
          courses={courses}
          classes={classes}
          rooms={rooms}
          isOffline={isDbOffline}
        />

      </div>
    </AppShell>
  );
}
