// LOG: [POLIMDO GO] Halaman Profil Mahasiswa dengan Offline Fallback
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import ProfileCard from './ProfileCard';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  let studentData = {
    name: session.user.name || 'Mahasiswa',
    email: session.user.email || '',
    nim: '-',
    program: 'Teknik Elektro',
    className: '-',
    image: session.user.image || null
  };
  let isDbOffline = false;

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

    if (studentProfile) {
      studentData = {
        name: session.user.name || 'Mahasiswa',
        email: session.user.email || '',
        nim: studentProfile.nim,
        program: studentProfile.program,
        className: studentProfile.class?.name || '-',
        image: session.user.image || null
      };
    }
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data profil simulasi.");
    studentData = {
      name: session.user.name || 'Michael Jackson (Simulasi)',
      email: session.user.email || 'mhs1@presensigo.com',
      nim: '22021001',
      program: 'D4 Teknik Informatika',
      className: 'TI 4-A',
      image: session.user.image || null
    };
  }

  return (
    <AppShell role="STUDENT" title="Profil Saya">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Tombol Kembali */}
        <Link href="/student/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950">
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>

        {/* Judul Halaman */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Profil Mahasiswa</h2>
          <p className="text-xs text-zinc-500">Detail akun dan informasi akademik Anda.</p>
        </div>

        {/* Card Profil */}
        <ProfileCard student={studentData} />

      </div>
    </AppShell>
  );
}
