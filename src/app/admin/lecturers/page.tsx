// LOG: [POLIMDO GO] Halaman Kelola Dosen Server-Side dengan AppShell dan CRUD Manager
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import LecturersManager from './LecturersManager';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function AdminLecturersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  let lecturers: any[] = [];
  let isDbOffline = false;

  try {
    const dbLecturers = await prisma.lecturerProfile.findMany({
      include: {
        user: true
      },
      orderBy: { nip: 'asc' }
    });
    lecturers = dbLecturers.map(l => ({
      id: l.id,
      nip: l.nip || '-',
      name: l.user.name,
      email: l.user.email
    }));
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data dosen simulasi.");
    lecturers = [
      { id: 'mock-1', nip: '0012038401', name: 'Dr. Ir. Dosen Elektro, M.T.', email: 'dosen@presensigo.com' }
    ];
  }

  return (
    <AppShell role="ADMIN" title="Kelola Dosen">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Tombol Kembali */}
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950">
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>

        {/* Judul Halaman */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Kelola Data Dosen</h2>
          <p className="text-xs text-zinc-500">Tambah, ubah, atau hapus data dosen pengampu di Politeknik Negeri Manado.</p>
        </div>

        {/* CRUD Manager */}
        <LecturersManager initialLecturers={lecturers} isOffline={isDbOffline} />

      </div>
    </AppShell>
  );
}
