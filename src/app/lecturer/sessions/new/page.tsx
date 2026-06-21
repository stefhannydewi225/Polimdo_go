// LOG: [POLIMDO GO] Halaman Pembuatan Sesi Presensi Baru Server-Side - Fix Decimal Serialization
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import NewSessionForm from './NewSessionForm';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewSessionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'LECTURER') {
    redirect('/login');
  }

  let schedules: any[] = [];
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

    let dbSchedules: any[] = [];

    if (lecturerProfile) {
      dbSchedules = await prisma.schedule.findMany({
        where: {
          course: { lecturerId: lecturerProfile.id }
        },
        include: {
          course: {
            include: {
              lecturer: {
                include: {
                  user: true
                }
              }
            }
          },
          class: true,
          room: true
        }
      });
    }

    // Fallback: Jika Dosen baru mendaftar, menggunakan mock session, atau belum memiliki jadwal mengajar,
    // tampilkan seluruh jadwal di database agar Dosen tetap dapat melakukan demo/pengujian.
    const isCustomList = dbSchedules.length === 0;
    if (isCustomList) {
      dbSchedules = await prisma.schedule.findMany({
        include: {
          course: {
            include: {
              lecturer: {
                include: {
                  user: true
                }
              }
            }
          },
          class: true,
          room: true
        }
      });
    }

    // Map to plain objects and strip Decimal values to prevent Next.js serialization crash
    schedules = dbSchedules.map(s => {
      const otherLecturerName = s.course.lecturer?.user?.name;
      const isOwn = lecturerProfile ? s.course.lecturerId === lecturerProfile.id : false;
      
      return {
        id: s.id,
        course: {
          name: isOwn 
            ? s.course.name 
            : `${s.course.name} (Dosen: ${otherLecturerName || 'Belum Diatur'})`,
          code: s.course.code
        },
        class: {
          name: s.class.name
        },
        room: {
          name: s.room.name,
          defaultRadiusMeters: s.room.defaultRadiusMeters
        },
        startTime: s.startTime,
        endTime: s.endTime
      };
    });
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data simulasi jadwal mengajar.");
    schedules = [
      {
        id: 'mock-sched-1',
        course: { name: 'Pemrograman Berbasis Platform', code: 'TI4001' },
        class: { name: 'TI 4-A' },
        room: { name: 'Lab RPL - Lt. 2 Elektro', defaultRadiusMeters: 50 },
        startTime: '08:00',
        endTime: '11:30'
      }
    ];
  }

  return (
    <AppShell role="LECTURER" title="Buat Sesi Presensi">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Tombol Kembali */}
        <Link href="/lecturer/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950">
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>

        {/* Judul */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Buat Sesi Presensi Baru</h2>
          <p className="text-xs text-zinc-500">Mulai kelas dan generate kode QR agar mahasiswa dapat melakukan presensi.</p>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <NewSessionForm schedules={schedules} isOffline={isDbOffline} />
        </div>

      </div>
    </AppShell>
  );
}
