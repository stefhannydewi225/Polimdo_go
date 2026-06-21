// LOG: [POLIMDO GO] API Route Admin Kelola Ruangan (POST / PUT / DELETE)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Akses ditolak.' }, { status: 403 });
    }

    const { name, latitude, longitude, defaultRadiusMeters } = await request.json();

    if (!name) {
      return NextResponse.json({ success: false, message: 'Nama Ruangan wajib diisi.' }, { status: 400 });
    }

    const finalLat = latitude !== undefined && latitude !== null ? Number(latitude) : 1.479585;
    const finalLng = longitude !== undefined && longitude !== null ? Number(longitude) : 124.897003;

    const room = await prisma.roomLocation.create({
      data: {
        name,
        latitude: finalLat,
        longitude: finalLng,
        defaultRadiusMeters: defaultRadiusMeters ? Number(defaultRadiusMeters) : 50
      }
    });

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        name: room.name,
        latitude: Number(room.latitude),
        longitude: Number(room.longitude),
        defaultRadiusMeters: room.defaultRadiusMeters
      },
      message: 'Ruangan berhasil disimpan.'
    });

  } catch (error: any) {
    console.error('Error add room:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Akses ditolak.' }, { status: 403 });
    }

    const { id, name, latitude, longitude, defaultRadiusMeters } = await request.json();

    if (!id || !name) {
      return NextResponse.json({ success: false, message: 'ID dan Nama Ruangan wajib diisi.' }, { status: 400 });
    }

    const finalLat = latitude !== undefined && latitude !== null ? Number(latitude) : 1.479585;
    const finalLng = longitude !== undefined && longitude !== null ? Number(longitude) : 124.897003;

    const room = await prisma.roomLocation.update({
      where: { id },
      data: {
        name,
        latitude: finalLat,
        longitude: finalLng,
        defaultRadiusMeters: defaultRadiusMeters ? Number(defaultRadiusMeters) : 50
      }
    });

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        name: room.name,
        latitude: Number(room.latitude),
        longitude: Number(room.longitude),
        defaultRadiusMeters: room.defaultRadiusMeters
      },
      message: 'Ruangan berhasil diupdate.'
    });

  } catch (error: any) {
    console.error('Error update room:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Akses ditolak.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID wajib dikirim.' }, { status: 400 });
    }

    await prisma.roomLocation.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Ruangan berhasil dihapus.'
    });

  } catch (error: any) {
    console.error('Error delete room:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus ruangan dari database. Pastikan tidak ada jadwal kuliah yang terikat ke ruangan ini.' },
      { status: 500 }
    );
  }
}
