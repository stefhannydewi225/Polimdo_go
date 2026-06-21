// LOG: [POLIMDO GO] API Route Penutupan Sesi Presensi oleh Dosen
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface CloseRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: CloseRouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'LECTURER') {
      return NextResponse.json({ success: false, message: 'Akses ditolak.' }, { status: 403 });
    }

    const resolvedParams = await context.params;
    const id = resolvedParams.id;

    // Update status to CLOSED
    let isDbOffline = false;
    try {
      await prisma.$executeRaw`SELECT 1`;
    } catch (e) {
      isDbOffline = true;
    }

    if (isDbOffline) {
      return NextResponse.json({
        success: true,
        message: 'Sesi presensi berhasil ditutup (Mode Simulasi).'
      });
    }

    await prisma.attendanceSession.update({
      where: { id },
      data: { status: 'CLOSED' }
    });

    return NextResponse.json({
      success: true,
      message: 'Sesi presensi berhasil ditutup.'
    });

  } catch (error: any) {
    console.error('Error close session:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan internal server.' },
      { status: 500 }
    );
  }
}
