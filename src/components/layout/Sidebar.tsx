// LOG: [POLIMDO GO] Komponen Sidebar Navigasi Desktop
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Calendar,
  QrCode,
  History,
  User,
  ClipboardList,
  PlusCircle,
  GraduationCap,
  UserCheck,
  BookOpen,
  Building2,
  MapPin,
  CalendarRange,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  role: 'STUDENT' | 'LECTURER' | 'ADMIN';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const getLinks = () => {
    switch (role) {
      case 'STUDENT':
        return [
          { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/student/schedule', label: 'Jadwal Kuliah', icon: Calendar },
          { href: '/student/attendance', label: 'Presensi', icon: QrCode },
          { href: '/student/history', label: 'Riwayat', icon: History },
          { href: '/student/profile', label: 'Profil Saya', icon: User },
        ];
      case 'LECTURER':
        return [
          { href: '/lecturer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/lecturer/sessions', label: 'Sesi Presensi', icon: ClipboardList },
          { href: '/lecturer/sessions/new', label: 'Buat Sesi Baru', icon: PlusCircle },
        ];
      case 'ADMIN':
        return [
          { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/admin/students', label: 'Kelola Mahasiswa', icon: GraduationCap },
          { href: '/admin/lecturers', label: 'Kelola Dosen', icon: UserCheck },
          { href: '/admin/courses', label: 'Kelola Matakuliah', icon: BookOpen },
          { href: '/admin/classes', label: 'Kelola Kelas', icon: Building2 },
          { href: '/admin/rooms', label: 'Kelola Ruangan', icon: MapPin },
          { href: '/admin/schedules', label: 'Kelola Jadwal', icon: CalendarRange },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-200/80 min-h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-200/80 flex items-center gap-3">
        <img 
          src="/logo.png" 
          alt="Polimdo Go Logo" 
          className="w-8 h-8 object-contain"
        />
        <div>
          <h2 className="font-bold text-zinc-900 leading-none">POLIMDO GO</h2>
          <span className="text-[9px] text-zinc-400 font-semibold tracking-wider">PRESENSI MAHASISWA</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile & Logout */}
      <div className="p-4 border-t border-zinc-200/80">
        <div className="flex items-center gap-3 mb-4 px-2">
          {session?.user?.image ? (
            <img 
              src={session.user.image} 
              alt={session.user.name || 'User'} 
              className="w-8 h-8 rounded-full object-cover border border-zinc-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
              {session?.user?.name ? session.user.name[0] : 'U'}
            </div>
          )}
          <div className="truncate">
            <h4 className="text-xs font-bold text-zinc-800 truncate">{session?.user?.name || 'User'}</h4>
            <p className="text-[10px] text-zinc-400 font-semibold tracking-wider">{role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
