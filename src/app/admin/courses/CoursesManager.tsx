// LOG: [POLIMDO GO] Komponen Kelola Mata Kuliah (CRUD Lengkap) Admin
'use strict';

'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle, BookOpen, X } from 'lucide-react';

interface Course {
  id: string;
  code: string;
  name: string;
  lecturerId?: string;
  lecturerName: string;
}

interface LecturerItem {
  id: string;
  name: string;
}

interface CoursesManagerProps {
  initialCourses: Course[];
  lecturers: LecturerItem[];
  isOffline: boolean;
}

export default function CoursesManager({ initialCourses, lecturers, isOffline }: CoursesManagerProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [lecturerId, setLecturerId] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartEdit = (course: Course) => {
    setEditingId(course.id);
    setCode(course.code);
    setName(course.name);
    setLecturerId(course.lecturerId || '');
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCode('');
    setName('');
    setLecturerId('');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!code.trim() || !name.trim() || !lecturerId) {
      return setError('Semua kolom wajib diisi');
    }

    setIsLoading(true);

    const selectedLecturer = lecturers.find(l => l.id === lecturerId);
    const lecturerName = selectedLecturer ? selectedLecturer.name : '-';

    if (editingId) {
      if (isOffline) {
        setCourses(courses.map(c => c.id === editingId ? { ...c, code, name, lecturerId, lecturerName } : c));
        setSuccess('Mata kuliah berhasil diupdate (Mode Simulasi).');
        handleCancelEdit();
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/courses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, code, name, lecturerId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal mengupdate data.');

        setCourses(courses.map(c => c.id === editingId ? data.course : c));
        setSuccess('Mata kuliah berhasil diupdate ke database Supabase.');
        handleCancelEdit();
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan sistem.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (isOffline) {
      const newCourse: Course = {
        id: `mock-course-${Date.now()}`,
        code,
        name,
        lecturerId,
        lecturerName
      };
      setCourses([newCourse, ...courses]);
      setSuccess('Mata kuliah berhasil ditambahkan (Mode Simulasi).');
      setCode('');
      setName('');
      setLecturerId('');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, lecturerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan data.');

      setCourses([data.course, ...courses]);
      setSuccess('Mata kuliah berhasil disimpan ke Supabase.');
      setCode('');
      setName('');
      setLecturerId('');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mata kuliah ini?')) return;

    setError(null);
    setSuccess(null);

    if (isOffline) {
      setCourses(courses.filter(c => c.id !== id));
      setSuccess('Mata kuliah berhasil dihapus (Mode Simulasi).');
      if (editingId === id) handleCancelEdit();
      return;
    }

    try {
      const res = await fetch(`/api/admin/courses?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus data.');

      setCourses(courses.filter(c => c.id !== id));
      setSuccess('Mata kuliah berhasil dihapus dari database.');
      if (editingId === id) handleCancelEdit();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus mata kuliah.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Form Add / Edit */}
      <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">
              {editingId ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium">
              {editingId ? 'Update kode, nama, & dosen pengampu.' : 'Input mata kuliah & tentukan dosen pengampu.'}
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
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Kode MK</label>
            <input
              type="text"
              required
              placeholder="e.g. TI4002"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Nama Mata Kuliah</label>
            <input
              type="text"
              required
              placeholder="e.g. Rekayasa Perangkat Lunak"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Dosen Pengampu</label>
            <select
              required
              value={lecturerId}
              onChange={(e) => setLecturerId(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Pilih Dosen --</option>
              {lecturers.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
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
              {editingId ? 'Update Mata Kuliah' : 'Tambah Mata Kuliah'}
            </button>
          </div>
        </form>
      </div>

      {/* Table List */}
      <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
          <h4 className="font-bold text-zinc-800 text-sm">Daftar Mata Kuliah</h4>
          <span className="text-[10px] bg-zinc-100 text-zinc-500 font-bold px-2 py-0.5 rounded-full">{courses.length} MK</span>
        </div>

        {courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-2.5 px-4 font-bold">Kode MK</th>
                  <th className="py-2.5 px-4 font-bold">Nama Mata Kuliah</th>
                  <th className="py-2.5 px-4 font-bold">Dosen Pengampu</th>
                  <th className="py-2.5 px-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-800 flex items-center gap-2">
                      <div className="p-1 bg-indigo-50 text-indigo-600 rounded">
                        <BookOpen size={14} />
                      </div>
                      {course.code}
                    </td>
                    <td className="py-3 px-4 text-zinc-900 font-semibold">{course.name}</td>
                    <td className="py-3 px-4 text-zinc-600 font-medium">{course.lecturerName}</td>
                    <td className="py-3 px-4 text-center flex justify-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(course)}
                        className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
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
            Belum ada data mata kuliah terdaftar.
          </div>
        )}
      </div>

    </div>
  );
}
