// LOG: [POLIMDO GO] Halaman Log Kehadiran Real-time Kelas untuk Sesi Dosen dengan Fitur Kelola
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, MapPin, AlertCircle, Users } from 'lucide-react';
import CloseSessionButton from './CloseSessionButton';
import AttendanceRecordsManager from './AttendanceRecordsManager';

interface RecordsPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function LecturerSessionRecordsPage({ params }: RecordsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'LECTURER') {
    redirect('/login');
  }

  // Resolve params in Next.js 15
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  let sessionDetails: any = null;
  let records: any[] = [];
  let classStudents: any[] = [];
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

    if (sessionDetails) {
      // Ambil records kehadiran
      records = await prisma.attendanceRecord.findMany({
        where: { sessionId: sessionId },
        include: {
          student: {
            include: {
              user: true
            }
          }
        },
        orderBy: { checkedInAt: 'desc' }
      });

      // Ambil daftar seluruh mahasiswa di kelas ini
      classStudents = await prisma.studentProfile.findMany({
        where: { classId: sessionDetails.schedule.class.id },
        include: {
          user: true
        },
        orderBy: {
          nim: 'asc'
        }
      });
    }
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data log presensi simulasi.");
  }

  // Fallback data simulasi jika DB offline atau data tidak ditemukan
  if (!sessionDetails) {
    sessionDetails = {
      id: sessionId,
      radiusMeters: 50,
      tokenExpiresAt: new Date(Date.now() + 1800000),
      status: 'ACTIVE',
      schedule: {
        course: { name: 'Pemrograman Berbasis Platform', code: 'TI4001' },
        class: { name: 'TI 4-A', id: 'mock-class-1' },
        room: { name: 'Lab RPL - Lt. 2 Elektro' }
      }
    };

    records = [
      {
        id: 'mock-rec-1',
        checkedInAt: new Date(Date.now() - 300000), // 5 menit lalu
        studentLatitude: 1.479580,
        studentLongitude: 124.897000,
        distanceMeters: 12.4,
        status: 'VALID',
        rejectionReason: null,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)',
        ipAddress: '192.168.1.12',
        student: {
          nim: '22021001',
          user: { name: 'Michael Jackson' }
        }
      },
      {
        id: 'mock-rec-2',
        checkedInAt: new Date(Date.now() - 180000), // 3 menit lalu
        studentLatitude: 1.478200,
        studentLongitude: 124.896100,
        distanceMeters: 182.5,
        status: 'REJECTED',
        rejectionReason: 'OUT_OF_RADIUS',
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S901B)',
        ipAddress: '10.0.2.15',
        student: {
          nim: '22021002',
          user: { name: 'Steve Rogers' }
        }
      }
    ];

    classStudents = [
      { id: 'mock-student-1', nim: '22021001', user: { name: 'Michael Jackson' } },
      { id: 'mock-student-2', nim: '22021002', user: { name: 'Steve Rogers' } },
      { id: 'mock-student-3', nim: '22021003', user: { name: 'Tony Stark' } }
    ];
  }

  // Ambil serialisasi Decimal untuk menghindari error Next.js Server Components -> Client Components
  const serializedRecords = records.map((rec) => ({
    ...rec,
    id: rec.id,
    studentId: rec.studentId || rec.student?.id || '',
    studentLatitude: rec.studentLatitude ? Number(rec.studentLatitude) : null,
    studentLongitude: rec.studentLongitude ? Number(rec.studentLongitude) : null,
    distanceMeters: rec.distanceMeters !== null ? Number(rec.distanceMeters) : null,
    status: rec.status,
    rejectionReason: rec.rejectionReason || null,
    checkedInAt: rec.checkedInAt instanceof Date ? rec.checkedInAt.toISOString() : new Date(rec.checkedInAt).toISOString(),
    userAgent: rec.userAgent || null,
    ipAddress: rec.ipAddress || null,
    student: {
      nim: rec.student?.nim || '',
      user: {
        name: rec.student?.user?.name || 'User'
      }
    }
  }));

  const serializedClassStudents = classStudents.map((st) => ({
    id: st.id,
    nim: st.nim,
    user: {
      name: st.user?.name || 'User'
    }
  }));

  return (
    <AppShell role="LECTURER" title="Kelola Kehadiran Sesi">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Tombol Navigasi */}
        <div className="flex justify-between items-center gap-3">
          <Link href="/lecturer/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950">
            <ArrowLeft size={14} />
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-3">
            {sessionDetails.status === 'ACTIVE' && (
              <CloseSessionButton id={sessionId} isOffline={isDbOffline} />
            )}
            <Link
              href={`/lecturer/sessions/${sessionId}/qr`}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Lihat QR Code Sesi
            </Link>
          </div>
        </div>

        {/* Ringkasan Sesi Kelas */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-zinc-900">{sessionDetails.schedule.course.name}</h3>
              <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                sessionDetails.status === 'ACTIVE'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-zinc-100 border border-zinc-200 text-zinc-500'
              }`}>
                {sessionDetails.status === 'ACTIVE' ? 'Aktif / Terbuka' : 'Tutup'}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 font-semibold">
              <span className="flex items-center gap-1">
                <Users size={14} />
                Kelas: {sessionDetails.schedule.class.name}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                Ruang: {sessionDetails.schedule.room.name}
              </span>
            </div>
          </div>
        </div>

        {/* Manajer Log Kehadiran Interaktif (Client-side) */}
        <AttendanceRecordsManager
          sessionId={sessionId}
          initialRecords={serializedRecords}
          classStudents={serializedClassStudents}
          isOffline={isDbOffline}
        />

      </div>
    </AppShell>
  );
}
