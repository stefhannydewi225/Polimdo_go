// LOG: [POLIMDO GO] Halaman Kelola Mahasiswa Server-Side dengan AppShell dan CRUD Manager
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import StudentsManager from './StudentsManager';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function AdminStudentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  let students: any[] = [];
  let classes: any[] = [];
  let isDbOffline = false;

  try {
    const dbStudents = await prisma.studentProfile.findMany({
      include: {
        user: true,
        class: true
      },
      orderBy: { nim: 'asc' }
    });
    students = dbStudents.map(s => ({
      id: s.id,
      nim: s.nim,
      name: s.user.name,
      email: s.user.email,
      program: s.program,
      classId: s.classId || '',
      className: s.class?.name || '-'
    }));

    const dbClasses = await prisma.class.findMany({
      orderBy: { name: 'asc' }
    });
    classes = dbClasses.map(c => ({
      id: c.id,
      name: c.name
    }));

  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data mahasiswa & kelas simulasi.");
    students = [
      { id: 'mock-1', nim: '22021001', name: 'Michael Jackson', email: 'mhs1@presensigo.com', program: 'D4 Teknik Informatika', classId: 'mock-class-1', className: 'TI 4-A' },
      { id: 'mock-2', nim: '22021002', name: 'Steve Rogers', email: 'mhs2@presensigo.com', program: 'D4 Teknik Informatika', classId: 'mock-class-1', className: 'TI 4-A' },
      { id: 'mock-3', nim: '22021003', name: 'Natasha Romanoff', email: 'mhs3@presensigo.com', program: 'D4 Teknik Informatika', classId: 'mock-class-1', className: 'TI 4-A' }
    ];
    classes = [
      { id: 'mock-class-1', name: 'TI 4-A' }
    ];
  }


  return (
    <AppShell role="ADMIN" title="Kelola Mahasiswa">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Tombol Kembali */}
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950">
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>

        {/* Judul Halaman */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Kelola Data Mahasiswa</h2>
          <p className="text-xs text-zinc-500">Tambah, ubah, atau hapus data mahasiswa terdaftar beserta informasi akunnya.</p>
        </div>

        {/* CRUD Manager */}
        <StudentsManager initialStudents={students} classes={classes} isOffline={isDbOffline} />

      </div>
    </AppShell>
  );
}
