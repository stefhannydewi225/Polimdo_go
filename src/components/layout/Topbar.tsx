// LOG: [POLIMDO GO] Komponen Topbar Header Aplikasi
'use strict';

'use client';

import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { LogOut, Bell, User } from 'lucide-react';

interface TopbarProps {
  role: 'STUDENT' | 'LECTURER' | 'ADMIN';
  title?: string;
}

export default function Topbar({ role, title = 'POLIMDO GO' }: TopbarProps) {
  const { data: session } = useSession();

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'ADMIN':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LECTURER':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <header className="bg-white border-b border-zinc-200/80 h-16 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Title / Section Name */}
      <div>
        <h1 className="font-bold text-zinc-900 text-base md:text-lg tracking-tight">{title}</h1>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {/* Role Badge */}
        <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase tracking-wider ${getRoleBadgeColor()}`}>
          {role === 'STUDENT' ? 'Mahasiswa' : role === 'LECTURER' ? 'Dosen' : 'Admin'}
        </span>

        {/* User Info (Desktop only) */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="text-right">
            <h4 className="text-xs font-bold text-zinc-800">{session?.user?.name || 'User'}</h4>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
              {role === 'STUDENT' ? `NIM: ${session?.user?.nim || '-'}` : role === 'LECTURER' ? `NIP: ${session?.user?.nip || '-'}` : 'Administrator'}
            </p>
          </div>
        </div>

        {/* Mobile Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors md:hidden"
          title="Keluar"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
