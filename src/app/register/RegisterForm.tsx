// LOG: [POLIMDO GO] Komponen Form Registrasi Client-Side
'use strict';

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ClassItem {
  id: string;
  name: string;
}

interface RegisterFormProps {
  classes: ClassItem[];
}

export default function RegisterForm({ classes }: RegisterFormProps) {
  const router = useRouter();

  const [role, setRole] = useState<'STUDENT' | 'LECTURER'>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nim, setNim] = useState('');
  const [nip, setNip] = useState('');
  const [program, setProgram] = useState('D4 Teknik Informatika');
  const [classId, setClassId] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Validasi Sederhana
    if (role === 'STUDENT' && (!nim || !classId || !program)) {
      setError('Semua parameter mahasiswa (NIM, Program Studi, Kelas) wajib diisi.');
      setIsLoading(false);
      return;
    }

    if (role === 'LECTURER' && !nip) {
      setError('NIP dosen wajib diisi.');
      setIsLoading(false);
      return;
    }

    // Validasi domain email resmi (sementara hanya @gmail.com)
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Registrasi ditolak. Hanya email dengan domain @gmail.com yang diperbolehkan saat ini.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          name,
          email,
          nim: role === 'STUDENT' ? nim : undefined,
          nip: role === 'LECTURER' ? nip : undefined,
          program: role === 'STUDENT' ? program : undefined,
          classId: role === 'STUDENT' ? classId : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal mendaftarkan akun.');
      }

      setSuccess(data.message || 'Registrasi berhasil! Mengalihkan ke halaman login...');
      
      // Tunggu 2 detik kemudian alihkan ke login
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs flex items-start gap-2">
          <CheckCircle size={16} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Pilihan Role */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
          Daftar Sebagai (Role)
        </label>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as 'STUDENT' | 'LECTURER');
            setError(null);
          }}
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50 text-zinc-800"
        >
          <option value="STUDENT">Mahasiswa (Student)</option>
          <option value="LECTURER">Dosen (Lecturer)</option>
        </select>
      </div>

      {/* Nama Lengkap */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
          Nama Lengkap
        </label>
        <input
          type="text"
          required
          placeholder="Masukkan nama lengkap Anda"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50 text-zinc-800"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
          Alamat Email
        </label>
        <input
          type="email"
          required
          placeholder="contoh@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50 text-zinc-800"
        />
        <p className="mt-1 text-[10px] text-zinc-400">Harap gunakan alamat email @gmail.com aktif Anda.</p>
      </div>

      {/* Form Tambahan Dosen */}
      {role === 'LECTURER' && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
            NIP Dosen
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: 0012038401"
            value={nip}
            onChange={(e) => setNip(e.target.value.replace(/\D/g, ''))}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50 text-zinc-800 font-mono"
          />
        </div>
      )}

      {/* Form Tambahan Mahasiswa */}
      {role === 'STUDENT' && (
        <>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
              NIM Mahasiswa
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 22021004"
              value={nim}
              onChange={(e) => setNim(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50 text-zinc-800 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Program Studi
            </label>
            <input
              type="text"
              required
              placeholder="D4 Teknik Informatika"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50 text-zinc-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Kelas Akademik
            </label>
            <select
              required
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50 text-zinc-800"
            >
              <option value="">-- Pilih Kelas --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Catatan Penting Mengenai Password */}
      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-700 leading-relaxed font-semibold">
        🛡️ Password Anda akan diset otomatis menggunakan NIM (untuk Mahasiswa) atau NIP (untuk Dosen) setelah pendaftaran berhasil.
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Mendaftarkan...
          </>
        ) : (
          <>
            <UserPlus size={16} />
            Daftar Akun Baru
          </>
        )}
      </button>

      <div className="text-center pt-2">
        <span className="text-xs text-zinc-400">Sudah memiliki akun? </span>
        <Link href="/login" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline">
          Masuk di Sini
        </Link>
      </div>
    </form>
  );
}
