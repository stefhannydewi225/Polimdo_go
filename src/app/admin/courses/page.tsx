// LOG: [POLIMDO GO] Halaman Kelola Mata Kuliah Admin dengan Toleransi Offline Fallback
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import CoursesManager from './CoursesManager';

export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  let courses: any[] = [];
  let lecturers: any[] = [];
  let isDbOffline = false;

  try {
    // Ambil data mata kuliah
    const dbCourses = await prisma.course.findMany({
      include: {
        lecturer: {
          include: { user: true }
        }
      },
      orderBy: { code: 'asc' }
    });
    courses = dbCourses.map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      lecturerId: c.lecturerId || '',
      lecturerName: c.lecturer?.user.name || '-'
    }));

    // Ambil data dosen pengampu
    const dbLecturers = await prisma.lecturerProfile.findMany({
      include: { user: true },
      orderBy: { user: { name: 'asc' } }
    });
    lecturers = dbLecturers.map(l => ({
      id: l.id,
      name: l.user.name
    }));
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data mata kuliah & dosen simulasi.");
    courses = [
      { id: '1', code: 'TI4001', name: 'Pemrograman Berbasis Platform', lecturerId: 'dosen-1', lecturerName: 'Dr. Ir. Dosen Elektro, M.T.' }
    ];
    lecturers = [
      { id: 'dosen-1', name: 'Dr. Ir. Dosen Elektro, M.T.' },
      { id: 'dosen-2', name: 'Drs. Dosen Elektro Lain, M.Kom.' }
    ];
  }


  return (
    <AppShell role="ADMIN" title="Kelola Mata Kuliah">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Tombol Kembali */}
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950">
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>

        {/* Judul */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Kelola Data Mata Kuliah</h2>
          <p className="text-xs text-zinc-500">Tambah, lihat, dan hapus mata kuliah jurusan elektro.</p>
        </div>

        {/* Manager Component (CRUD) */}
        <CoursesManager initialCourses={courses} lecturers={lecturers} isOffline={isDbOffline} />

      </div>
    </AppShell>
  );
}

