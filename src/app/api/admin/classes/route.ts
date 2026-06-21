// LOG: [POLIMDO GO] API Route Admin Kelola Kelas (POST / PUT / DELETE)
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

    const { name, program } = await request.json();

    if (!name || !program) {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    // Simpan ke database
    const cls = await prisma.class.create({
      data: {
        name,
        program
      }
    });

    return NextResponse.json({
      success: true,
      class: {
        id: cls.id,
        name: cls.name,
        program: cls.program || '-'
      },
      message: 'Kelas berhasil ditambahkan.'
    });

  } catch (error: any) {
    console.error('Error add class:', error);
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

    const { id, name, program } = await request.json();

    if (!id || !name || !program) {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    // Update database
    const cls = await prisma.class.update({
      where: { id },
      data: {
        name,
        program
      }
    });

    return NextResponse.json({
      success: true,
      class: {
        id: cls.id,
        name: cls.name,
        program: cls.program || '-'
      },
      message: 'Kelas berhasil diupdate.'
    });

  } catch (error: any) {
    console.error('Error update class:', error);
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

    await prisma.class.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Kelas berhasil dihapus.'
    });

  } catch (error: any) {
    console.error('Error delete class:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus kelas dari database. Pastikan tidak ada data yang terikat (seperti mahasiswa atau jadwal).' },
      { status: 500 }
    );
  }
}
