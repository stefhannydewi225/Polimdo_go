// LOG: [POLIMDO GO] API Route Admin Kelola Jadwal (POST / PUT / DELETE)
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

    const { courseId, classId, roomId, dayOfWeek, startTime, endTime } = await request.json();

    if (!courseId || !classId || !roomId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    // Simpan ke database
    const schedule = await prisma.schedule.create({
      data: {
        courseId,
        classId,
        roomId,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime
      },
      include: {
        course: {
          include: {
            lecturer: {
              include: { user: true }
            }
          }
        },
        class: true,
        room: true
      }
    });

    return NextResponse.json({
      success: true,
      schedule: {
        id: schedule.id,
        courseId: schedule.courseId,
        classId: schedule.classId,
        roomId: schedule.roomId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        courseName: schedule.course.name,
        className: schedule.class.name,
        roomName: schedule.room.name,
        lecturerName: schedule.course.lecturer?.user.name || '-'
      },
      message: 'Jadwal berhasil ditambahkan.'
    });

  } catch (error: any) {
    console.error('Error add schedule:', error);
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

    const { id, courseId, classId, roomId, dayOfWeek, startTime, endTime } = await request.json();

    if (!id || !courseId || !classId || !roomId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    // Update database
    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        courseId,
        classId,
        roomId,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime
      },
      include: {
        course: {
          include: {
            lecturer: {
              include: { user: true }
            }
          }
        },
        class: true,
        room: true
      }
    });

    return NextResponse.json({
      success: true,
      schedule: {
        id: schedule.id,
        courseId: schedule.courseId,
        classId: schedule.classId,
        roomId: schedule.roomId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        courseName: schedule.course.name,
        className: schedule.class.name,
        roomName: schedule.room.name,
        lecturerName: schedule.course.lecturer?.user.name || '-'
      },
      message: 'Jadwal berhasil diupdate.'
    });

  } catch (error: any) {
    console.error('Error update schedule:', error);
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

    await prisma.schedule.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Jadwal berhasil dihapus.'
    });

  } catch (error: any) {
    console.error('Error delete schedule:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus jadwal dari database.' },
      { status: 500 }
    );
  }
}
