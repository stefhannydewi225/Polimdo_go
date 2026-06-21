// LOG: [POLIMDO GO] Halaman Kelola Ruangan Lokasi GPS Admin Server-Side
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import RoomsManager from './RoomsManager';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function AdminRoomsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  let rooms: any[] = [];
  let isDbOffline = false;

  try {
    const dbRooms = await prisma.roomLocation.findMany({
      orderBy: { name: 'asc' }
    });
    // Ubah Decimal Prisma ke standard number agar tidak error serialisasi client-side
    rooms = dbRooms.map(r => ({
      id: r.id,
      name: r.name,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      defaultRadiusMeters: r.defaultRadiusMeters
    }));
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan data lokasi ruangan simulasi.");
    rooms = [
      {
        id: 'mock-room-1',
        name: 'Lab Rekayasa Perangkat Lunak - Lt. 2 Elektro',
        latitude: 1.479585,
        longitude: 124.897003,
        defaultRadiusMeters: 50
      }
    ];
  }

  return (
    <AppShell role="ADMIN" title="Kelola Ruangan & Lokasi">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Tombol Kembali */}
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950">
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>

        {/* Judul Halaman */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Kelola Ruangan & Lokasi GPS</h2>
          <p className="text-xs text-zinc-500">Daftar ruangan kelas beserta titik koordinat latitude, longitude, dan radius validasi presensi.</p>
        </div>

        {/* Komponen Pengelola */}
        <RoomsManager initialRooms={rooms} isOffline={isDbOffline} />

      </div>
    </AppShell>
  );
}
