// LOG: [POLIMDO GO] Komponen Client Profil Mahasiswa & Keluar Akun
'use strict';

'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { User, Mail, GraduationCap, School, LogOut, CheckCircle, ShieldAlert } from 'lucide-react';

interface ProfileCardProps {
  student: {
    name: string;
    email: string;
    nim: string;
    program: string;
    className: string;
    image?: string | null;
  };
}

export default function ProfileCard({ student }: ProfileCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari akun?')) {
      signOut({ callbackUrl: '/login' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      
      {/* Sisi Kiri - Avatar & Tombol Logout */}
      <div className="md:col-span-4 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
        {/* Lingkaran Avatar */}
        {student.image ? (
          <img 
            src={student.image} 
            alt={student.name} 
            className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100 shadow-md shadow-indigo-100/50"
          />
        ) : (
          <div className="w-20 h-20 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center text-2xl font-extrabold shadow-md shadow-indigo-100 transition-colors">
            {getInitials(student.name)}
          </div>
        )}
        <div>
          <h3 className="font-extrabold text-zinc-900 text-base">{student.name}</h3>
          <p className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-1.5 inline-block">
            Mahasiswa Aktif
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors mt-4"
        >
          <LogOut size={15} />
          Keluar dari Akun
        </button>
      </div>

      {/* Sisi Kanan - Informasi Detail Akun */}
      <div className="md:col-span-8 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div>
          <h4 className="font-bold text-zinc-800 text-sm uppercase tracking-wider border-b border-zinc-100 pb-2">Informasi Akademik</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* NIM */}
          <div className="flex gap-3">
            <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-500 shrink-0 h-9 w-9 flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-bold uppercase block tracking-wider">Nomor Induk Mahasiswa</span>
              <span className="text-xs font-bold text-zinc-800">{student.nim}</span>
            </div>
          </div>

          {/* Program Studi */}
          <div className="flex gap-3">
            <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-500 shrink-0 h-9 w-9 flex items-center justify-center">
              <School size={18} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-bold uppercase block tracking-wider">Program Studi</span>
              <span className="text-xs font-bold text-zinc-800">{student.program}</span>
            </div>
          </div>

          {/* Kelas */}
          <div className="flex gap-3">
            <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-500 shrink-0 h-9 w-9 flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-bold uppercase block tracking-wider">Kelas Akademik</span>
              <span className="text-xs font-bold text-zinc-800">{student.className}</span>
            </div>
          </div>

          {/* Status Validasi Akun */}
          <div className="flex gap-3">
            <div className="p-2 bg-green-50 border border-green-100 rounded-lg text-green-600 shrink-0 h-9 w-9 flex items-center justify-center">
              <CheckCircle size={18} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-bold uppercase block tracking-wider">Status Validasi</span>
              <span className="text-xs font-bold text-green-700">Tervalidasi GPS & QR</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 space-y-4">
          <h4 className="font-bold text-zinc-800 text-sm uppercase tracking-wider">Informasi Akun</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex gap-3">
              <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-500 shrink-0 h-9 w-9 flex items-center justify-center">
                <Mail size={18} />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase block tracking-wider">Email Terdaftar</span>
                <span className="text-xs font-bold text-zinc-800">{student.email}</span>
              </div>
            </div>

            {/* Keamanan Sandi */}
            <div className="flex gap-3">
              <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg text-amber-600 shrink-0 h-9 w-9 flex items-center justify-center">
                <ShieldAlert size={18} />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase block tracking-wider">Keamanan Akun</span>
                <span className="text-xs font-bold text-amber-700">Sandi Terenkripsi</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
