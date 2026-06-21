// LOG: [POLIMDO GO] Komponen Kelola Mahasiswa (CRUD Lengkap) Admin
'use strict';

'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle, GraduationCap, X } from 'lucide-react';

interface Student {
  id: string;
  nim: string;
  name: string;
  email: string;
  program: string;
  classId?: string;
  className: string;
}

interface ClassItem {
  id: string;
  name: string;
}

interface StudentsManagerProps {
  initialStudents: Student[];
  classes: ClassItem[];
  isOffline: boolean;
}

export default function StudentsManager({ initialStudents, classes, isOffline }: StudentsManagerProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nim, setNim] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [program, setProgram] = useState('D4 Teknik Informatika');
  const [classId, setClassId] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartEdit = (student: Student) => {
    setEditingId(student.id);
    setNim(student.nim);
    setName(student.name);
    setEmail(student.email);
    setProgram(student.program);
    setClassId(student.classId || '');
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNim('');
    setName('');
    setEmail('');
    setProgram('D4 Teknik Informatika');
    setClassId('');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nim.trim() || !name.trim() || !email.trim() || !classId) {
      return setError('Semua kolom formulir wajib diisi');
    }

    setIsLoading(true);

    const selectedClass = classes.find(c => c.id === classId);
    const className = selectedClass ? selectedClass.name : '-';

    if (editingId) {
      if (isOffline) {
        setStudents(students.map(s => s.id === editingId ? { ...s, nim, name, email, program, classId, className } : s));
        setSuccess('Mahasiswa berhasil diupdate (Mode Simulasi).');
        handleCancelEdit();
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/students', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, nim, name, email, program, classId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal mengupdate data.');

        setStudents(students.map(s => s.id === editingId ? data.student : s));
        setSuccess('Data mahasiswa berhasil diupdate ke Supabase.');
        handleCancelEdit();
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan sistem.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (isOffline) {
      const newStudent: Student = {
        id: `mock-student-${Date.now()}`,
        nim,
        name,
        email,
        program,
        classId,
        className
      };
      setStudents([newStudent, ...students]);
      setSuccess('Mahasiswa berhasil ditambahkan (Mode Simulasi).');
      setNim('');
      setName('');
      setEmail('');
      setClassId('');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim, name, email, program, classId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan data.');

      setStudents([data.student, ...students]);
      setSuccess('Data mahasiswa berhasil disimpan ke Supabase.');
      setNim('');
      setName('');
      setEmail('');
      setClassId('');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mahasiswa ini?')) return;
    
    setError(null);
    setSuccess(null);

    if (isOffline) {
      setStudents(students.filter(s => s.id !== id));
      setSuccess('Mahasiswa berhasil dihapus (Mode Simulasi).');
      if (editingId === id) handleCancelEdit();
      return;
    }

    try {
      const res = await fetch(`/api/admin/students?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus data.');

      setStudents(students.filter(s => s.id !== id));
      setSuccess('Data mahasiswa berhasil dihapus dari database.');
      if (editingId === id) handleCancelEdit();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus mahasiswa.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Sisi Kiri - Form Add / Edit */}
      <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">
              {editingId ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium">
              {editingId ? 'Update NIM & profil mahasiswa.' : 'Input NIM & akun mahasiswa baru.'}
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
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">NIM</label>
            <input
              type="text"
              required
              placeholder="e.g. 22021004"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              placeholder="e.g. Tony Stark"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="e.g. mhs4@presensigo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Program Studi</label>
            <input
              type="text"
              required
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              {editingId ? 'Update Mahasiswa' : 'Tambah Mahasiswa'}
            </button>
          </div>
        </form>
      </div>

      {/* Sisi Kanan - Table List */}
      <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
          <h4 className="font-bold text-zinc-800 text-sm">Daftar Mahasiswa</h4>
          <span className="text-[10px] bg-zinc-100 text-zinc-500 font-bold px-2 py-0.5 rounded-full">{students.length} Orang</span>
        </div>

        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-2.5 px-4 font-bold">NIM</th>
                  <th className="py-2.5 px-4 font-bold">Nama Lengkap</th>
                  <th className="py-2.5 px-4 font-bold">Program Studi</th>
                  <th className="py-2.5 px-4 font-bold text-center">Kelas</th>
                  <th className="py-2.5 px-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-800 flex items-center gap-2">
                      <div className="p-1 bg-indigo-50 text-indigo-600 rounded">
                        <GraduationCap size={14} />
                      </div>
                      {student.nim}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-zinc-900">{student.name}</p>
                      <p className="text-[9px] text-zinc-400 font-medium truncate max-w-[150px]">{student.email}</p>
                    </td>
                    <td className="py-3 px-4 text-zinc-500">{student.program}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold rounded-full uppercase text-[9px]">
                        {student.className}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center flex justify-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(student)}
                        className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
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
            Belum ada data mahasiswa terdaftar.
          </div>
        )}
      </div>

    </div>
  );
}
