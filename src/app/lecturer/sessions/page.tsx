// LOG: [POLIMDO GO] Halaman Riwayat Sesi Presensi Dosen dengan Offline Fallback
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import SessionsHistoryList from './SessionsHistoryList';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function LecturerSessionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'LECTURER') {
    redirect('/login');
  }

  let sessions: any[] = [];
  let isDbOffline = false;

  try {
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
      const dbSessions = await prisma.attendanceSession.findMany({
        where: { lecturerId: lecturerProfile.id },
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

      sessions = dbSessions.map(s => ({
        id: s.id,
        courseName: s.schedule.course.name,
        courseCode: s.schedule.course.code,
        className: s.schedule.class.name,
        roomName: s.schedule.room.name,
        createdAt: s.createdAt.toISOString(),
        status: s.status,
        expiresAt: s.tokenExpiresAt.toISOString(),
        validCount: s._count.records
      }));
    }
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data riwayat sesi simulasi.");
    sessions = [
      {
        id: 'mock-sess-1',
        courseName: 'Pemrograman Berbasis Platform',
        courseCode: 'TI4001',
        className: 'TI 4-A',
        roomName: 'Lab RPL - Lt. 2 Elektro',
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 jam lalu
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 1800000).toISOString(),
        validCount: 2
      },
      {
        id: 'mock-sess-2',
        courseName: 'Jaringan Komputer',
        courseCode: 'TI4003',
        className: 'TI 4-B',
        roomName: 'Lab Jaringan - Lt. 1 Elektro',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 hari lalu
        status: 'CLOSED',
        expiresAt: new Date(Date.now() - 86400000 + 300000).toISOString(),
        validCount: 15
      }
    ];
  }

  return (
    <AppShell role="LECTURER" title="Riwayat Sesi Presensi">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Tombol Kembali */}
        <Link href="/lecturer/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950">
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>

        {/* Judul Halaman */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Riwayat Sesi Presensi</h2>
          <p className="text-xs text-zinc-500">Daftar kelas presensi QR yang pernah diaktifkan sebelumnya.</p>
        </div>

        {/* List Riwayat */}
        <SessionsHistoryList initialSessions={sessions} isOffline={isDbOffline} />

      </div>
    </AppShell>
  );
}

