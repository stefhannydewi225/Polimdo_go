// LOG: [POLIMDO GO] Komponen Client Riwayat Sesi Presensi Dosen
'use strict';

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, Search, PowerOff } from 'lucide-react';

interface SessionItem {
  id: string;
  courseName: string;
  courseCode: string;
  className: string;
  roomName: string;
  createdAt: string; // ISO string
  status: 'ACTIVE' | 'CLOSED' | 'EXPIRED';
  expiresAt: string; // ISO string
  validCount: number;
}

interface SessionsHistoryListProps {
  initialSessions: SessionItem[];
  isOffline: boolean;
}

export default function SessionsHistoryList({ initialSessions, isOffline }: SessionsHistoryListProps) {
  const [sessions, setSessions] = useState<SessionItem[]>(initialSessions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');
  
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCloseSession = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menutup sesi presensi ini? Mahasiswa tidak akan bisa lagi melakukan presensi.')) {
      return;
    }

    setLoadingId(id);
    setError(null);
    setSuccess(null);

    if (isOffline) {
      setSessions(sessions.map(s => s.id === id ? { ...s, status: 'CLOSED' } : s));
      setSuccess('Sesi berhasil ditutup (Mode Simulasi).');
      setLoadingId(null);
      return;
    }

    try {
      const res = await fetch(`/api/sessions/${id}/close`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menutup sesi.');
      }

      setSessions(sessions.map(s => s.id === id ? { ...s, status: 'CLOSED' } : s));
      setSuccess('Sesi presensi berhasil ditutup.');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoadingId(null);
    }
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = 
      s.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.className.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ? true : s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs">
          {success}
        </div>
      )}

      {/* Filter & Pencarian */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari mata kuliah atau kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              statusFilter === 'ALL'
                ? 'bg-zinc-950 text-white border-zinc-950'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Semua Sesi
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setStatusFilter('CLOSED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              statusFilter === 'CLOSED'
                ? 'bg-zinc-600 text-white border-zinc-600'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Selesai / Tutup
          </button>
        </div>
      </div>

      {/* List Sesi */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredSessions.map((session) => {
            const dateFormatted = new Date(session.createdAt).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'Asia/Makassar'
            });
            const timeFormatted = new Date(session.createdAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Makassar'
            });

            return (
              <div
                key={session.id}
                className={`bg-white border rounded-xl p-5 shadow-sm space-y-4 transition-all ${
                  session.status === 'ACTIVE' ? 'border-emerald-500/30' : 'border-zinc-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                          session.status === 'ACTIVE'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-zinc-100 border border-zinc-200 text-zinc-500'
                        }`}
                      >
                        {session.status === 'ACTIVE' ? 'Aktif' : 'Tutup'}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {dateFormatted} pada {timeFormatted} WITA
                      </span>
                    </div>
                    <h4 className="font-bold text-zinc-900 text-base">{session.courseName}</h4>
                    <p className="text-xs text-zinc-500">Mata Kuliah: {session.courseCode} | Kelas: {session.className}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-lg shrink-0 self-start">
                    <Users size={14} className="text-indigo-600" />
                    <span>Hadir: <strong className="text-zinc-800 font-bold">{session.validCount}</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-100">
                  <Link
                    href={`/lecturer/sessions/${session.id}/records`}
                    className="flex-1 py-1.5 px-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-lg text-center transition-colors border border-zinc-200"
                  >
                    Daftar Hadir
                  </Link>
                  {session.status === 'ACTIVE' ? (
                    <>
                      <Link
                        href={`/lecturer/sessions/${session.id}/qr`}
                        className="flex-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg text-center transition-colors border border-indigo-200"
                      >
                        QR Code
                      </Link>
                      <button
                        onClick={() => handleCloseSession(session.id)}
                        disabled={loadingId === session.id}
                        className="flex-1 py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg text-center transition-colors border border-rose-200 disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <PowerOff size={12} />
                        Tutup Sesi
                      </button>
                    </>
                  ) : (
                    <span className="flex-1 py-1.5 px-3 bg-zinc-100 text-zinc-400 text-xs font-semibold rounded-lg text-center border border-zinc-200 select-none">
                      Sesi Berakhir
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-zinc-300 rounded-xl p-10 text-center">
          <Calendar size={36} className="text-zinc-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-800">Tidak ada sesi yang ditemukan</p>
          <p className="text-xs text-zinc-400 mt-0.5">Sesuaikan pencarian atau mulai sesi presensi baru.</p>
        </div>
      )}
    </div>
  );
}
