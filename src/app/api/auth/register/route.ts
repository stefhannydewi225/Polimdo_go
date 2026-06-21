// LOG: [POLIMDO GO] API Route Registrasi Akun Mahasiswa & Dosen dengan Auto-Hash NIM/NIP
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, nim, nip, program, classId } = body;

    // 1. Validasi Kolom Umum Wajib
    if (!name || !email || !role) {
      return NextResponse.json(
        { success: false, message: 'Nama Lengkap, Email, dan Role wajib diisi.' },
        { status: 400 }
      );
    }

    if (role !== 'STUDENT' && role !== 'LECTURER') {
      return NextResponse.json(
        { success: false, message: 'Role pendaftaran tidak valid.' },
        { status: 400 }
      );
    }

    // 2. Cek Koneksi Database
    let isDbOffline = false;
    try {
      await prisma.$executeRaw`SELECT 1`;
    } catch (e) {
      isDbOffline = true;
    }

    if (isDbOffline) {
      console.warn("Database offline. Mensimulasikan hasil registrasi.");
      return NextResponse.json({
        success: true,
        message: 'Registrasi berhasil disimulasikan (Mode Offline/Simulasi).'
      });
    }

    // 3. Cek Duplikasi Email di Database
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar di sistem.' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);

    // 4. Proses Pendaftaran Berdasarkan Role
    if (role === 'STUDENT') {
      // Validasi Parameter Mahasiswa
      if (!nim || !program || !classId) {
        return NextResponse.json(
          { success: false, message: 'NIM, Program Studi, dan Kelas wajib diisi untuk Mahasiswa.' },
          { status: 400 }
        );
      }

      // Cek Duplikasi NIM
      const existingStudentByNim = await prisma.studentProfile.findUnique({
        where: { nim }
      });

      if (existingStudentByNim) {
        return NextResponse.json(
          { success: false, message: 'NIM sudah terdaftar di sistem.' },
          { status: 400 }
        );
      }

      // Hash password otomatis menggunakan NIM mahasiswa
      const passwordHash = await bcrypt.hash(nim, salt);

      // Simpan User & Profil Mahasiswa dalam satu transaksi
      await prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            name,
            email: email.toLowerCase(),
            passwordHash,
            role: UserRole.STUDENT,
            studentProfile: {
              create: {
                nim,
                program,
                classId
              }
            }
          }
        });
      });

    } else if (role === 'LECTURER') {
      // Validasi Parameter Dosen
      if (!nip) {
        return NextResponse.json(
          { success: false, message: 'NIP wajib diisi untuk Dosen.' },
          { status: 400 }
        );
      }

      // Cek Duplikasi NIP
      const existingLecturerByNip = await prisma.lecturerProfile.findUnique({
        where: { nip }
      });

      if (existingLecturerByNip) {
        return NextResponse.json(
          { success: false, message: 'NIP sudah terdaftar di sistem.' },
          { status: 400 }
        );
      }

      // Hash password otomatis menggunakan NIP dosen
      const passwordHash = await bcrypt.hash(nip, salt);

      // Simpan User & Profil Dosen dalam satu transaksi
      await prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            name,
            email: email.toLowerCase(),
            passwordHash,
            role: UserRole.LECTURER,
            lecturerProfile: {
              create: {
                nip
              }
            }
          }
        });
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil. Akun Anda telah diaktifkan.'
    });

  } catch (error: any) {
    console.error('Error saat registrasi akun:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem internal.' },
      { status: 500 }
    );
  }
}
