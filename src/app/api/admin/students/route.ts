// LOG: [POLIMDO GO] API Route Admin Kelola Mahasiswa (POST / PUT / DELETE)
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

    const { nim, name, email, program, classId } = await request.json();

    if (!nim || !name || !email || !classId) {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    // Hash default password 'mhs123'
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('mhs123', salt);

    // Jalankan transaksi prisma: Buat User + Profil Mahasiswa
    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'STUDENT',
          studentProfile: {
            create: {
              nim,
              program,
              classId
            }
          }
        },
        include: {
          studentProfile: {
            include: { class: true }
          }
        }
      });
      return user.studentProfile!;
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        nim: student.nim,
        name: name,
        email: email,
        program: student.program,
        className: student.class?.name || '-'
      },
      message: 'Mahasiswa berhasil didaftarkan.'
    });

  } catch (error: any) {
    console.error('Error add student:', error);
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

    const { id, nim, name, email, program, classId } = await request.json();

    if (!id || !nim || !name || !email || !classId) {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    const student = await prisma.studentProfile.update({
      where: { id },
      data: {
        nim,
        program,
        classId,
        user: {
          update: {
            name,
            email
          }
        }
      },
      include: {
        user: true,
        class: true
      }
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        nim: student.nim,
        name: student.user.name,
        email: student.user.email,
        program: student.program,
        className: student.class?.name || '-'
      },
      message: 'Mahasiswa berhasil diupdate.'
    });

  } catch (error: any) {
    console.error('Error update student:', error);
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

    // Cari User ID dari Student Profile tersebut untuk dihapus agar cascade terpicu
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id }
    });

    if (!studentProfile) {
      return NextResponse.json({ success: false, message: 'Profil mahasiswa tidak ditemukan.' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: studentProfile.userId }
    });

    return NextResponse.json({
      success: true,
      message: 'Mahasiswa berhasil dihapus.'
    });

  } catch (error: any) {
    console.error('Error delete student:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
