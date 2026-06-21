// LOG: [POLIMDO GO] Komponen AppShell Shell Layout Utama Aplikasi
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import { Loader2 } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  role: 'STUDENT' | 'LECTURER' | 'ADMIN';
  title?: string;
}

export default function AppShell({ children, role, title }: AppShellProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-screen bg-[#f8f9ff]">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin text-indigo-600 mx-auto" size={36} />
          <p className="text-sm font-semibold text-zinc-500">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  // Pengaman cadangan client-side jika belum di-redirect oleh middleware
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f9ff]">
      {/* Desktop Sidebar */}
      <Sidebar role={role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <Topbar role={role} title={title} />

        {/* Page Content Body */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav role={role} />
      </div>
    </div>
  );
}
