// LOG: [POLIMDO GO] API Route Admin Kelola Mata Kuliah (POST / PUT / DELETE)
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

    const { code, name, lecturerId } = await request.json();

    if (!code || !name || !lecturerId) {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    // Periksa apakah kode mata kuliah sudah terdaftar
    const existingCourse = await prisma.course.findUnique({
      where: { code }
    });

    if (existingCourse) {
      return NextResponse.json({ success: false, message: 'Kode mata kuliah sudah terdaftar.' }, { status: 400 });
    }

    // Simpan ke database
    const course = await prisma.course.create({
      data: {
        code,
        name,
        lecturerId
      },
      include: {
        lecturer: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        code: course.code,
        name: course.name,
        lecturerId: course.lecturerId || '',
        lecturerName: course.lecturer?.user.name || '-'
      },
      message: 'Mata kuliah berhasil ditambahkan.'
    });

  } catch (error: any) {
    console.error('Error add course:', error);
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

    const { id, code, name, lecturerId } = await request.json();

    if (!id || !code || !name || !lecturerId) {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    // Periksa apakah kode mata kuliah sudah digunakan oleh mata kuliah lain
    const existingCourse = await prisma.course.findFirst({
      where: {
        code,
        NOT: { id }
      }
    });

    if (existingCourse) {
      return NextResponse.json({ success: false, message: 'Kode mata kuliah sudah digunakan oleh data lain.' }, { status: 400 });
    }

    // Update database
    const course = await prisma.course.update({
      where: { id },
      data: {
        code,
        name,
        lecturerId
      },
      include: {
        lecturer: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        code: course.code,
        name: course.name,
        lecturerId: course.lecturerId || '',
        lecturerName: course.lecturer?.user.name || '-'
      },
      message: 'Mata kuliah berhasil diupdate.'
    });

  } catch (error: any) {
    console.error('Error update course:', error);
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

    await prisma.course.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Mata kuliah berhasil dihapus.'
    });

  } catch (error: any) {
    console.error('Error delete course:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus mata kuliah dari database.' },
      { status: 500 }
    );
  }
}
