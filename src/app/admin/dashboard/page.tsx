// LOG: [POLIMDO GO] Halaman Dashboard Admin dengan Toleransi Offline Fallback
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { GraduationCap, UserCheck, BookOpen, MapPin, AlertCircle, Building2, CalendarRange, ChevronRight } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  let counts = { students: 3, lecturers: 1, courses: 1, rooms: 1 };
  let isDbOffline = false;

  try {
    const students = await prisma.studentProfile.count();
    const lecturers = await prisma.lecturerProfile.count();
    const courses = await prisma.course.count();
    const rooms = await prisma.roomLocation.count();
    counts = { students, lecturers, courses, rooms };
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan jumlah count simulasi untuk admin.");
  }

  const adminMenu = [
    { href: '/admin/students', label: 'Kelola Mahasiswa', desc: 'Input & kelola NIM, kelas, prodi mahasiswa.', icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50' },
    { href: '/admin/lecturers', label: 'Kelola Dosen', desc: 'Input & kelola NIP dan dosen pengampu.', icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
    { href: '/admin/courses', label: 'Kelola Mata Kuliah', desc: 'Tambah & hubungkan mata kuliah dengan dosen.', icon: BookOpen, color: 'text-rose-600 bg-rose-50' },
    { href: '/admin/classes', label: 'Kelola Kelas', desc: 'Manajemen tingkat kelas dan program studi.', icon: Building2, color: 'text-cyan-600 bg-cyan-50' },
    { href: '/admin/rooms', label: 'Kelola Ruangan & Lokasi', desc: 'Kelola latitude, longitude, dan radius kelas.', icon: MapPin, color: 'text-amber-600 bg-amber-50' },
    { href: '/admin/schedules', label: 'Kelola Jadwal Kuliah', desc: 'Hubungkan kelas, ruangan, hari, dan jam kuliah.', icon: CalendarRange, color: 'text-violet-600 bg-violet-50' },
  ];

  return (
    <AppShell role="ADMIN" title="Beranda Admin">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Mahasiswa</span>
            <span className="text-2xl font-extrabold text-zinc-800 mt-2">{counts.students}</span>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Dosen</span>
            <span className="text-2xl font-extrabold text-zinc-800 mt-2">{counts.lecturers}</span>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Mata Kuliah</span>
            <span className="text-2xl font-extrabold text-zinc-800 mt-2">{counts.courses}</span>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Ruangan</span>
            <span className="text-2xl font-extrabold text-zinc-800 mt-2">{counts.rooms}</span>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="space-y-3">
          <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider text-zinc-500">Manajemen Master Data</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adminMenu.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group bg-white border border-zinc-200 hover:border-indigo-200 rounded-xl p-5 shadow-sm hover:shadow transition-all flex items-start gap-4"
                >
                  <div className={`p-3 rounded-lg ${item.color} shrink-0`}>
                    <Icon size={22} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-zinc-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {item.label}
                      </h4>
                      <ChevronRight size={16} className="text-zinc-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-indigo-50/50 border border-indigo-200/50 rounded-xl text-xs text-indigo-900 leading-relaxed">
          <strong>Perhatian:</strong> Untuk MVP skripsi ini, konfigurasi master data awal (mahasiswa, dosen, ruangan, jadwal) direkomendasikan melalui file <code>prisma/seed.ts</code> untuk efisiensi demo. Form manajemen CRUD di atas dapat digunakan untuk memodifikasi atau memeriksa data secara manual.
        </div>

      </div>
    </AppShell>
  );
}
