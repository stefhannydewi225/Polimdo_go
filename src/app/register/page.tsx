// LOG: [POLIMDO GO] Halaman Registrasi Akun Server-Side
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RegisterForm from './RegisterForm';
import Link from 'next/link';

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  // Jika sudah login, langsung arahkan ke dashboard
  if (session?.user) {
    const role = session.user.role;
    if (role === 'STUDENT') {
      redirect('/student/dashboard');
    } else if (role === 'LECTURER') {
      redirect('/lecturer/dashboard');
    } else if (role === 'ADMIN') {
      redirect('/admin/dashboard');
    }
  }

  let classes: any[] = [];
  let isDbOffline = false;

  try {
    const dbClasses = await prisma.class.findMany({
      orderBy: { name: 'asc' }
    });
    classes = dbClasses.map(c => ({
      id: c.id,
      name: c.name
    }));
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data kelas simulasi untuk registrasi.");
    classes = [
      { id: 'mock-class-1', name: 'TI 4-A' }
    ];
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md w-full space-y-8">
        
        {/* Branding & Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <img 
              src="/logo.png" 
              alt="Polimdo Go Logo" 
              className="w-10 h-10 object-contain"
            />
            <div className="text-left">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">POLIMDO GO</h2>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Politeknik Negeri Manado</span>
            </div>
          </Link>
          <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Daftar Akun Baru
          </h3>
          <p className="mt-1 text-sm text-zinc-500 max-w-xs mx-auto">
            Registrasi Mahasiswa & Dosen POLIMDO GO
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-100/50 dark:shadow-none">
          <RegisterForm classes={classes} />
        </div>

      </div>
    </div>
  );
}
import prisma from '@/lib/prisma';
