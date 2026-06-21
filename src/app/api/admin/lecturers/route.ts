// LOG: [POLIMDO GO] API Route Admin Kelola Dosen (POST / PUT / DELETE)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Akses ditolak.' }, { status: 403 });
    }

    const { nip, name, email } = await request.json();

    if (!nip || !name || !email) {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    // Hash default password 'dosen123'
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('dosen123', salt);

    // Jalankan transaksi prisma: Buat User + Profil Dosen
    const lecturer = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'LECTURER',
          lecturerProfile: {
            create: {
              nip
            }
          }
        },
        include: {
          lecturerProfile: true
        }
      });
      return user.lecturerProfile!;
    });

    return NextResponse.json({
      success: true,
      lecturer: {
        id: lecturer.id,
        nip: lecturer.nip || '-',
        name: name,
        email: email
      },
      message: 'Dosen berhasil didaftarkan.'
    });

  } catch (error: any) {
    console.error('Error add lecturer:', error);
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

    const { id, nip, name, email } = await request.json();

    if (!id || !nip || !name || !email) {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    const lecturer = await prisma.lecturerProfile.update({
      where: { id },
      data: {
        nip,
        user: {
          update: {
            name,
            email
          }
        }
      },
      include: {
        user: true
      }
    });

    return NextResponse.json({
      success: true,
      lecturer: {
        id: lecturer.id,
        nip: lecturer.nip || '-',
        name: lecturer.user.name,
        email: lecturer.user.email
      },
      message: 'Data dosen berhasil diupdate.'
    });

  } catch (error: any) {
    console.error('Error update lecturer:', error);
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

    // Cari User ID dari Lecturer Profile tersebut untuk dihapus agar cascade terpicu
    const lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { id }
    });

    if (!lecturerProfile) {
      return NextResponse.json({ success: false, message: 'Profil dosen tidak ditemukan.' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: lecturerProfile.userId }
    });

    return NextResponse.json({
      success: true,
      message: 'Dosen berhasil dihapus.'
    });

  } catch (error: any) {
    console.error('Error delete lecturer:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
