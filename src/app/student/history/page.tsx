// LOG: [POLIMDO GO] Halaman Riwayat Kehadiran Mahasiswa
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import prisma from '@/lib/prisma';
import { AlertCircle, CheckCircle, XCircle, MapPin, Calendar, Clock } from 'lucide-react';

export default async function StudentHistory() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  let records: any[] = [];
  let isDbOffline = false;

  try {
    let studentProfile = null;
    if (session.user.id) {
      studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id }
      });
    }

    if (!studentProfile && session.user.nim) {
      studentProfile = await prisma.studentProfile.findUnique({
        where: { nim: session.user.nim }
      });
    }

    if (!studentProfile && session.user.email) {
      studentProfile = await prisma.studentProfile.findFirst({
        where: { user: { email: session.user.email } }
      });
    }

    if (studentProfile) {
      records = await prisma.attendanceRecord.findMany({
        where: { studentId: studentProfile.id },
        include: {
          session: {
            include: {
              schedule: {
                include: {
                  course: true,
                  room: true
                }
              }
            }
          }
        },
        orderBy: { checkedInAt: 'desc' }
      });
    }
  } catch (error) {
    isDbOffline = true;
    console.warn("Database offline. Menggunakan riwayat simulasi untuk mahasiswa.");
    records = [
      {
        id: 'mock-rec-1',
        checkedInAt: new Date(Date.now() - 3600000), // 1 jam yang lalu
        distanceMeters: 14.5,
        status: 'VALID',
        rejectionReason: null,
        session: {
          schedule: {
            course: { name: 'Pemrograman Berbasis Platform' },
            room: { name: 'Lab RPL - Lt. 2 Elektro' }
          }
        }
      },
      {
        id: 'mock-rec-2',
        checkedInAt: new Date(Date.now() - 86400000), // 1 hari yang lalu
        distanceMeters: 182.3,
        status: 'REJECTED',
        rejectionReason: 'OUT_OF_RADIUS',
        session: {
          schedule: {
            course: { name: 'Pemrograman Berbasis Platform' },
            room: { name: 'Lab RPL - Lt. 2 Elektro' }
          }
        }
      }
    ];
  }

  const getRejectionText = (reason: string) => {
    switch (reason) {
      case 'INVALID_TOKEN': return 'Token QR tidak valid';
      case 'QR_EXPIRED': return 'QR Code sudah kedaluwarsa';
      case 'SESSION_CLOSED': return 'Sesi presensi sudah ditutup';
      case 'OUT_OF_RADIUS': return 'Berada di luar radius presensi';
      case 'ALREADY_ATTENDED': return 'Sudah melakukan presensi';
      case 'LOCATION_UNAVAILABLE': return 'Lokasi GPS tidak ditemukan';
      default: return 'Gagal validasi';
    }
  };

  return (
    <AppShell role="STUDENT" title="Riwayat Presensi">
      <div className="max-w-4xl mx-auto space-y-6">
        


        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Log Presensi Saya</h2>
          <p className="text-xs text-zinc-500">Daftar kehadiran Anda yang terekam beserta hasil validasinya.</p>
        </div>

        {/* Records list */}
        {records.length > 0 ? (
          <div className="space-y-3">
            {records.map((rec) => {
              const dateStr = new Date(rec.checkedInAt).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'Asia/Makassar'
              });
              const timeStr = new Date(rec.checkedInAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Makassar'
              });
              const isValid = rec.status === 'VALID';

              return (
                <div key={rec.id} className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                  <div className="space-y-1">
                    <h4 className="font-bold text-zinc-900 text-sm sm:text-base">
                      {rec.session.schedule.course.name}
                    </h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {dateStr}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {timeStr} WITA
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {rec.session.schedule.room.name}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge & Jarak */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      {isValid ? (
                        <>
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            Hadir
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="text-red-600" />
                          <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            Ditolak
                          </span>
                        </>
                      )}
                    </div>
                    
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Jarak Validasi</p>
                      <p className="text-xs font-bold text-zinc-800">
                        {rec.distanceMeters !== null ? `${rec.distanceMeters} m` : 'N/A'}
                      </p>
                      {!isValid && rec.rejectionReason && (
                        <p className="text-[10px] text-red-600 font-medium mt-0.5 max-w-[200px]">
                          Ket: {getRejectionText(rec.rejectionReason)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-zinc-300 rounded-xl p-8 text-center text-zinc-500 text-xs">
            Belum ada riwayat kehadiran tercatat.
          </div>
        )}

      </div>
    </AppShell>
  );
}
