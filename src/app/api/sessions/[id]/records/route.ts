// LOG: [POLIMDO GO] API Route Manajemen Rekaman Presensi oleh Dosen (POST, PUT, DELETE)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Helper untuk validasi akses dosen ke sesi
async function validateSessionLecturer(sessionId: string, userId: string) {
  try {
    const sessionDetails = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { lecturer: true }
    });
    
    if (!sessionDetails) return { valid: false, error: 'Sesi presensi tidak ditemukan.' };
    if (sessionDetails.lecturer.userId !== userId) {
      return { valid: false, error: 'Anda tidak memiliki hak akses untuk mengelola sesi ini.' };
    }
    return { valid: true, session: sessionDetails };
  } catch (error) {
    return { valid: false, isOffline: true };
  }
}

// 1. POST: Tambah Kehadiran Manual oleh Dosen
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'LECTURER') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const sessionId = resolvedParams.id;

    const body = await request.json();
    const { studentId, status } = body;

    if (!studentId || !status) {
      return NextResponse.json({ success: false, message: 'studentId dan status wajib diisi' }, { status: 400 });
    }

    // Validasi status
    const validStatuses = ['VALID', 'REJECTED', 'SICK', 'PERMISSION'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Status tidak valid' }, { status: 400 });
    }

    // Validasi akses dosen ke sesi
    const validation = await validateSessionLecturer(sessionId, session.user.id);
    if (!validation.valid && !validation.isOffline) {
      return NextResponse.json({ success: false, message: validation.error }, { status: 403 });
    }

    // Mode Offline
    if (validation.isOffline) {
      console.warn("Database offline. Menjalankan simulasi tambah kehadiran.");
      return NextResponse.json({
        success: true,
        message: 'Kehadiran manual berhasil disimpan (Mode Simulasi).',
        record: {
          id: `mock-rec-${Math.random().toString(36).substr(2, 9)}`,
          sessionId,
          studentId,
          status,
          checkedInAt: new Date().toISOString()
        }
      });
    }

    // Periksa apakah sudah ada log kehadiran untuk mahasiswa ini di sesi tersebut
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        sessionId_studentId: { sessionId, studentId }
      }
    });

    if (existingRecord) {
      return NextResponse.json({
        success: false,
        message: 'Mahasiswa sudah memiliki rekaman kehadiran di sesi ini. Gunakan EDIT untuk mengubah.'
      }, { status: 400 });
    }

    const newRecord = await prisma.attendanceRecord.create({
      data: {
        sessionId,
        studentId,
        status,
        studentLatitude: null,
        studentLongitude: null,
        distanceMeters: null,
        userAgent: `Manual oleh Dosen: ${session.user.name}`,
        ipAddress: '127.0.0.1'
      },
      include: {
        student: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Kehadiran manual berhasil dicatat.',
      record: newRecord
    });

  } catch (error) {
    console.error('Error manual post attendance:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// 2. PUT: Ubah Status Kehadiran oleh Dosen
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'LECTURER') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const sessionId = resolvedParams.id;

    const body = await request.json();
    const { recordId, status } = body;

    if (!recordId || !status) {
      return NextResponse.json({ success: false, message: 'recordId dan status wajib diisi' }, { status: 400 });
    }

    // Validasi status
    const validStatuses = ['VALID', 'REJECTED', 'SICK', 'PERMISSION'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Status tidak valid' }, { status: 400 });
    }

    // Validasi akses dosen ke sesi
    const validation = await validateSessionLecturer(sessionId, session.user.id);
    if (!validation.valid && !validation.isOffline) {
      return NextResponse.json({ success: false, message: validation.error }, { status: 403 });
    }

    // Mode Offline
    if (validation.isOffline) {
      console.warn("Database offline. Menjalankan simulasi edit kehadiran.");
      return NextResponse.json({
        success: true,
        message: 'Status kehadiran berhasil diperbarui (Mode Simulasi).',
        record: { id: recordId, status }
      });
    }

    const updatedRecord = await prisma.attendanceRecord.update({
      where: { id: recordId },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? 'INVALID_TOKEN' : null // Reset alasan jika bukan REJECTED
      },
      include: {
        student: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Status kehadiran berhasil diperbarui.',
      record: updatedRecord
    });

  } catch (error) {
    console.error('Error edit attendance record:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// 3. DELETE: Hapus Kehadiran oleh Dosen
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'LECTURER') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const sessionId = resolvedParams.id;

    const body = await request.json();
    const { recordId } = body;

    if (!recordId) {
      return NextResponse.json({ success: false, message: 'recordId wajib diisi' }, { status: 400 });
    }

    // Validasi akses dosen ke sesi
    const validation = await validateSessionLecturer(sessionId, session.user.id);
    if (!validation.valid && !validation.isOffline) {
      return NextResponse.json({ success: false, message: validation.error }, { status: 403 });
    }

    // Mode Offline
    if (validation.isOffline) {
      console.warn("Database offline. Menjalankan simulasi hapus kehadiran.");
      return NextResponse.json({
        success: true,
        message: 'Data kehadiran berhasil dihapus (Mode Simulasi).',
        recordId
      });
    }

    await prisma.attendanceRecord.delete({
      where: { id: recordId }
    });

    return NextResponse.json({
      success: true,
      message: 'Data kehadiran berhasil dihapus.',
      recordId
    });

  } catch (error) {
    console.error('Error delete attendance record:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
