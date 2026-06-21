// LOG: [POLIMDO GO] Halaman Kelola Kelas Admin dengan Toleransi Offline Fallback
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import ClassesManager from './ClassesManager';

export default async function AdminClassesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  let classes: any[] = [];
  let isDbOffline = false;

  try {
    const dbClasses = await prisma.class.findMany({
      orderBy: { name: 'asc' }
    });
    classes = dbClasses.map(c => ({
      id: c.id,
      name: c.name,
      program: c.program || '-'
    }));
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data kelas simulasi.");
    classes = [
      { id: '1', name: 'TI 4-A', program: 'D4 Teknik Informatika' }
    ];
  }

  return (
    <AppShell role="ADMIN" title="Kelola Kelas">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Tombol Kembali */}
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950">
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>

        {/* Judul */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Kelola Data Kelas</h2>
          <p className="text-xs text-zinc-500">Tambah, lihat, dan hapus kelas akademik Politeknik Negeri Manado.</p>
        </div>

        {/* Manager Component (CRUD) */}
        <ClassesManager initialClasses={classes} isOffline={isDbOffline} />

      </div>
    </AppShell>
  );
}

