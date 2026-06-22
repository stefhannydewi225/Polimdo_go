import 'dotenv/config';
import { UserRole } from '@prisma/client';
import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Memulai seeding data POLIMDO GO...');

  // Hapus data lama untuk reset state database
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.course.deleteMany();
  await prisma.class.deleteMany();
  await prisma.roomLocation.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.lecturerProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database dibersihkan.');

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  // Password Dosen adalah NIP-nya sendiri (0012038401)
  const lecturerPasswordHash = await bcrypt.hash('0012038401', salt);

  // 1. Buat User Admin
  await prisma.user.create({
    data: {
      name: 'Admin Jurusan Teknik Elektro',
      email: 'admin.polimdo@gmail.com',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });

  // 2. Buat User Dosen & Profil
  const lecturerUser = await prisma.user.create({
    data: {
      name: 'Dr. Ir. Dosen Elektro, M.T.',
      email: 'dosen.polimdo@gmail.com',
      passwordHash: lecturerPasswordHash,
      role: UserRole.LECTURER,
      lecturerProfile: {
        create: {
          nip: '0012038401',
        },
      },
    },
    include: {
      lecturerProfile: true,
    },
  });
  const lecturerProfile = lecturerUser.lecturerProfile!;

  // 3. Buat Kelas
  const class4A = await prisma.class.create({
    data: {
      name: 'TI 4-A',
      program: 'D4 Teknik Informatika',
    },
  });

  // 4. Buat User Mahasiswa & Profil (Password Mahasiswa adalah NIM-nya sendiri)
  const studentsData = [
    { name: 'Michael Jackson', email: 'mhs1.polimdo@gmail.com', nim: '22021001' },
    { name: 'Steve Rogers', email: 'mhs2.polimdo@gmail.com', nim: '22021002' },
    { name: 'Natasha Romanoff', email: 'mhs3.polimdo@gmail.com', nim: '22021003' },
  ];

  for (const student of studentsData) {
    const studentPasswordHash = await bcrypt.hash(student.nim, salt);
    await prisma.user.create({
      data: {
        name: student.name,
        email: student.email,
        passwordHash: studentPasswordHash,
        role: UserRole.STUDENT,
        studentProfile: {
          create: {
            nim: student.nim,
            program: 'D4 Teknik Informatika',
            classId: class4A.id,
          },
        },
      },
    });
  }

  // 5. Buat Mata Kuliah
  const coursePBP = await prisma.course.create({
    data: {
      name: 'Pemrograman Berbasis Platform',
      code: 'TI4001',
      lecturerId: lecturerProfile.id,
    },
  });

  // 6. Buat Lokasi Ruangan (Koordinat Politeknik Negeri Manado Kampus Elektro)
  // Latitude: 1.479585, Longitude: 124.897003
  const roomLab = await prisma.roomLocation.create({
    data: {
      name: 'Lab Rekayasa Perangkat Lunak - Lt. 2 Elektro',
      latitude: 1.479585,
      longitude: 124.897003,
      defaultRadiusMeters: 50,
    },
  });

  // 7. Buat Jadwal Kuliah (Hari Jumat, 08:00 - 11:30)
  // dayOfWeek: 5 = Jumat (sesuai standar JavaScript Date.getDay() dengan penyesuaian jika perlu, di sini kita gunakan 1=Senin s.d 7=Minggu atau 0=Minggu s.d 6=Sabtu)
  // Di sini kita gunakan standar 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat, 6=Sabtu, 0=Minggu
  const schedule = await prisma.schedule.create({
    data: {
      courseId: coursePBP.id,
      classId: class4A.id,
      roomId: roomLab.id,
      dayOfWeek: 5, // Jumat
      startTime: '08:00',
      endTime: '11:30',
    },
  });

  console.log('Seeding selesai dengan sukses!');
  console.log('Informasi Akun Demo:');
  console.log('1. Admin   : admin.polimdo@gmail.com / admin123');
  console.log('2. Dosen   : dosen.polimdo@gmail.com / 0012038401 (NIP)');
  console.log('3. Mhs 1   : mhs1.polimdo@gmail.com / 22021001 (NIM)');
  console.log('4. Mhs 2   : mhs2.polimdo@gmail.com / 22021002 (NIM)');
  console.log('5. Mhs 3   : mhs3.polimdo@gmail.com / 22021003 (NIM)');
  console.log(`Mata Kuliah: ${coursePBP.name} (${coursePBP.code})`);
  console.log(`Kelas      : ${class4A.name}`);
  console.log(`Ruangan    : ${roomLab.name} (Radius: ${roomLab.defaultRadiusMeters}m)`);
  console.log(`Jadwal     : Hari Ke-5 (Jumat), ${schedule.startTime} - ${schedule.endTime}`);
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
