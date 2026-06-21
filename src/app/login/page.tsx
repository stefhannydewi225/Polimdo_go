// LOG: [POLIMDO GO] Halaman Login Utama Server-Side
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import Link from 'next/link';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  // Jika sudah login, arahkan ke rute dashboard masing-masing role
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
            Masuk Ke Akun Anda
          </h3>
          <p className="mt-1 text-sm text-zinc-500 max-w-xs mx-auto">
            Presensi Mahasiswa Berbasis QR Code dan Lokasi
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-100/50 dark:shadow-none">
          <LoginForm />
          <div className="text-center mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-xs text-zinc-400">Belum memiliki akun? </span>
            <Link href="/register" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline">
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
