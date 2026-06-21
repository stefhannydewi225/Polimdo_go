// LOG: [POLIMDO GO] Komponen BottomNav Tab Bar untuk Mobile View
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  CalendarRange
} from 'lucide-react';

interface BottomNavProps {
  role: 'STUDENT' | 'LECTURER' | 'ADMIN';
}

export default function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();

  const getLinks = () => {
    switch (role) {
      case 'STUDENT':
        return [
          { href: '/student/dashboard', label: 'Beranda', icon: LayoutDashboard },
          { href: '/student/schedule', label: 'Jadwal', icon: Calendar },
          { href: '/student/attendance', label: 'Presensi', icon: QrCode },
          { href: '/student/history', label: 'Riwayat', icon: History },
          { href: '/student/profile', label: 'Profil', icon: User },
        ];
      case 'LECTURER':
        return [
          { href: '/lecturer/dashboard', label: 'Beranda', icon: LayoutDashboard },
          { href: '/lecturer/sessions', label: 'Sesi', icon: ClipboardList },
          { href: '/lecturer/sessions/new', label: 'Buat Baru', icon: PlusCircle },
        ];
      case 'ADMIN':
        return [
          { href: '/admin/dashboard', label: 'Beranda', icon: LayoutDashboard },
          { href: '/admin/students', label: 'Mhs', icon: GraduationCap },
          { href: '/admin/lecturers', label: 'Dosen', icon: UserCheck },
          { href: '/admin/rooms', label: 'Lokasi', icon: MapPin },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <nav className="md:hidden bg-white border-t border-zinc-200/80 fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-2 z-20 shadow-lg shadow-zinc-200/50">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              isActive ? 'text-indigo-600' : 'text-zinc-400'
            }`}
          >
            <Icon size={20} className={isActive ? 'scale-110 transition-transform' : ''} />
            <span className="text-[10px] font-semibold tracking-tight">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
