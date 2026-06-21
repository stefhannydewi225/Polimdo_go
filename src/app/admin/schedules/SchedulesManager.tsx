// LOG: [POLIMDO GO] Komponen Kelola Jadwal (CRUD Lengkap) Admin
'use strict';

'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle, Calendar, X } from 'lucide-react';

interface CourseItem {
  id: string;
  code: string;
  name: string;
}

interface ClassItem {
  id: string;
  name: string;
}

interface RoomItem {
  id: string;
  name: string;
}

interface ScheduleItem {
  id: string;
  courseId?: string;
  classId?: string;
  roomId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  courseName: string;
  className: string;
  roomName: string;
  lecturerName: string;
}

interface SchedulesManagerProps {
  initialSchedules: ScheduleItem[];
  courses: CourseItem[];
  classes: ClassItem[];
  rooms: RoomItem[];
  isOffline: boolean;
}

export default function SchedulesManager({
  initialSchedules,
  courses,
  classes,
  rooms,
  isOffline
}: SchedulesManagerProps) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [courseId, setCourseId] = useState('');
  const [classId, setClassId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:30');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getDayName = (day: number) => {
    switch (day) {
      case 1: return 'Senin';
      case 2: return 'Selasa';
      case 3: return 'Rabu';
      case 4: return 'Kamis';
      case 5: return 'Jumat';
      case 6: return 'Sabtu';
      case 7: return 'Minggu';
      default: return 'Hari';
    }
  };

  const handleStartEdit = (s: ScheduleItem) => {
    setEditingId(s.id);
    setCourseId(s.courseId || '');
    setClassId(s.classId || '');
    setRoomId(s.roomId || '');
    setDayOfWeek(s.dayOfWeek.toString());
    setStartTime(s.startTime);
    setEndTime(s.endTime);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCourseId('');
    setClassId('');
    setRoomId('');
    setDayOfWeek('1');
    setStartTime('08:00');
    setEndTime('10:30');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!courseId || !classId || !roomId || !dayOfWeek || !startTime || !endTime) {
      return setError('Semua kolom wajib diisi');
    }

    const dayNum = Number(dayOfWeek);

    setIsLoading(true);

    const selectedCourse = courses.find(c => c.id === courseId);
    const selectedClass = classes.find(c => c.id === classId);
    const selectedRoom = rooms.find(r => r.id === roomId);

    if (editingId) {
      if (isOffline) {
        setSchedules(schedules.map(s => s.id === editingId ? {
          ...s,
          courseId,
          classId,
          roomId,
          dayOfWeek: dayNum,
          startTime,
          endTime,
          courseName: selectedCourse ? selectedCourse.name : 'Mata Kuliah',
          className: selectedClass ? selectedClass.name : 'Kelas',
          roomName: selectedRoom ? selectedRoom.name : 'Ruangan',
          lecturerName: 'Dr. Ir. Dosen Elektro, M.T.'
        } : s));
        setSuccess('Jadwal berhasil diupdate (Mode Simulasi).');
        handleCancelEdit();
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/schedules', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            courseId,
            classId,
            roomId,
            dayOfWeek: dayNum,
            startTime,
            endTime
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal mengupdate data.');

        setSchedules(schedules.map(s => s.id === editingId ? data.schedule : s));
        setSuccess('Jadwal berhasil diupdate ke database Supabase.');
        handleCancelEdit();
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan sistem.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (isOffline) {
      const newSchedule: ScheduleItem = {
        id: `mock-schedule-${Date.now()}`,
        courseId,
        classId,
        roomId,
        dayOfWeek: dayNum,
        startTime,
        endTime,
        courseName: selectedCourse ? selectedCourse.name : 'Mata Kuliah',
        className: selectedClass ? selectedClass.name : 'Kelas',
        roomName: selectedRoom ? selectedRoom.name : 'Ruangan',
        lecturerName: 'Dr. Ir. Dosen Elektro, M.T.'
      };

      setSchedules([newSchedule, ...schedules]);
      setSuccess('Jadwal berhasil ditambahkan (Mode Simulasi).');
      handleCancelEdit();
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          classId,
          roomId,
          dayOfWeek: dayNum,
          startTime,
          endTime
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan data.');

      setSchedules([data.schedule, ...schedules]);
      setSuccess('Jadwal berhasil disimpan ke database Supabase.');
      handleCancelEdit();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    setError(null);
    setSuccess(null);

    if (isOffline) {
      setSchedules(schedules.filter(s => s.id !== id));
      setSuccess('Jadwal berhasil dihapus (Mode Simulasi).');
      if (editingId === id) handleCancelEdit();
      return;
    }

    try {
      const res = await fetch(`/api/admin/schedules?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus data.');

      setSchedules(schedules.filter(s => s.id !== id));
      setSuccess('Jadwal berhasil dihapus dari database.');
      if (editingId === id) handleCancelEdit();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus jadwal.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Form Add / Edit */}
      <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">
              {editingId ? 'Edit Jadwal' : 'Tambah Jadwal'}
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium">
              {editingId ? 'Update parameter jadwal perkuliahan.' : 'Input parameter jadwal perkuliahan.'}
            </p>
          </div>
          {editingId && (
            <button 
              onClick={handleCancelEdit}
              className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-600 transition-colors"
              title="Batal Edit"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-1.5">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-2.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs flex items-center gap-1.5">
            <CheckCircle size={14} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Mata Kuliah</label>
            <select
              required
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>[{c.code}] {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Kelas</label>
            <select
              required
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Pilih Kelas --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Ruangan / Lokasi</label>
            <select
              required
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Pilih Ruangan --</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Hari Kuliah</label>
            <select
              required
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1">Senin</option>
              <option value="2">Selasa</option>
              <option value="3">Rabu</option>
              <option value="4">Kamis</option>
              <option value="5">Jumat</option>
              <option value="6">Sabtu</option>
              <option value="7">Minggu</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Jam Mulai</label>
              <input
                type="text"
                required
                placeholder="e.g. 08:00"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Jam Selesai</label>
              <input
                type="text"
                required
                placeholder="e.g. 10:30"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 py-2 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-lg text-xs font-semibold transition-colors"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {editingId ? 'Update Jadwal' : 'Tambah Jadwal'}
            </button>
          </div>
        </form>
      </div>

      {/* Table List */}
      <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
          <h4 className="font-bold text-zinc-800 text-sm">Daftar Jadwal</h4>
          <span className="text-[10px] bg-zinc-100 text-zinc-500 font-bold px-2 py-0.5 rounded-full">{schedules.length} Jadwal</span>
        </div>

        {schedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-2.5 px-4 font-bold">Waktu</th>
                  <th className="py-2.5 px-4 font-bold">Mata Kuliah / Kelas</th>
                  <th className="py-2.5 px-4 font-bold">Dosen Pengampu / Ruangan</th>
                  <th className="py-2.5 px-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-medium text-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-indigo-50 text-indigo-600 rounded">
                          <Calendar size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{getDayName(s.dayOfWeek)}</p>
                          <p className="text-[10px] text-zinc-400 font-mono">{s.startTime} - {s.endTime}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-900">
                      <p className="font-semibold text-xs">{s.courseName}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">Kelas: {s.className}</p>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 font-medium">
                      <p className="text-zinc-700">{s.lecturerName}</p>
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-violet-50 border border-violet-100 text-violet-700 font-bold rounded text-[9px] uppercase">
                        {s.roomName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center flex justify-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(s)}
                        className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-400 text-xs">
            Belum ada data jadwal terdaftar.
          </div>
        )}
      </div>

    </div>
  );
}
