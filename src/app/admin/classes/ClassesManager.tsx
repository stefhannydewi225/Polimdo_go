// LOG: [POLIMDO GO] Komponen Kelola Kelas (CRUD Lengkap) Admin
'use strict';

'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle, School, X } from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
  program: string;
}

interface ClassesManagerProps {
  initialClasses: ClassItem[];
  isOffline: boolean;
}

export default function ClassesManager({ initialClasses, isOffline }: ClassesManagerProps) {
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [program, setProgram] = useState('D4 Teknik Informatika');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartEdit = (cls: ClassItem) => {
    setEditingId(cls.id);
    setName(cls.name);
    setProgram(cls.program);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setProgram('D4 Teknik Informatika');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !program.trim()) {
      return setError('Semua kolom wajib diisi');
    }

    setIsLoading(true);

    if (editingId) {
      if (isOffline) {
        setClasses(classes.map(c => c.id === editingId ? { ...c, name, program } : c));
        setSuccess('Kelas berhasil diupdate (Mode Simulasi).');
        handleCancelEdit();
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/classes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, name, program }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal mengupdate data.');

        setClasses(classes.map(c => c.id === editingId ? data.class : c));
        setSuccess('Kelas berhasil diupdate ke database Supabase.');
        handleCancelEdit();
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan sistem.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (isOffline) {
      const newClass: ClassItem = {
        id: `mock-class-${Date.now()}`,
        name,
        program
      };
      setClasses([newClass, ...classes]);
      setSuccess('Kelas berhasil ditambahkan (Mode Simulasi).');
      setName('');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, program }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan data.');

      setClasses([data.class, ...classes]);
      setSuccess('Kelas berhasil disimpan ke database Supabase.');
      setName('');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kelas ini?')) return;

    setError(null);
    setSuccess(null);

    if (isOffline) {
      setClasses(classes.filter(c => c.id !== id));
      setSuccess('Kelas berhasil dihapus (Mode Simulasi).');
      if (editingId === id) handleCancelEdit();
      return;
    }

    try {
      const res = await fetch(`/api/admin/classes?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus data.');

      setClasses(classes.filter(c => c.id !== id));
      setSuccess('Kelas berhasil dihapus dari database.');
      if (editingId === id) handleCancelEdit();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus kelas.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Form Add / Edit */}
      <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">
              {editingId ? 'Edit Kelas' : 'Tambah Kelas'}
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium">
              {editingId ? 'Update nama kelas & program studi.' : 'Input kelas & tentukan program studi.'}
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
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Nama Kelas</label>
            <input
              type="text"
              required
              placeholder="e.g. TI 4-A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Program Studi / Program</label>
            <select
              required
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="D4 Teknik Informatika">D4 Teknik Informatika</option>
              <option value="D3 Teknik Komputer">D3 Teknik Komputer</option>
              <option value="D3 Teknik Listrik">D3 Teknik Listrik</option>
              <option value="D4 Teknik Listrik (PSt)">D4 Teknik Listrik (PSt)</option>
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
              {editingId ? 'Update Kelas' : 'Tambah Kelas'}
            </button>
          </div>
        </form>
      </div>

      {/* Table List */}
      <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
          <h4 className="font-bold text-zinc-800 text-sm">Daftar Kelas</h4>
          <span className="text-[10px] bg-zinc-100 text-zinc-500 font-bold px-2 py-0.5 rounded-full">{classes.length} Kelas</span>
        </div>

        {classes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-2.5 px-4 font-bold">Nama Kelas</th>
                  <th className="py-2.5 px-4 font-bold">Program Studi</th>
                  <th className="py-2.5 px-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-bold text-zinc-800 flex items-center gap-2">
                      <div className="p-1 bg-indigo-50 text-indigo-600 rounded">
                        <School size={14} />
                      </div>
                      {cls.name}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 font-semibold">{cls.program}</td>
                    <td className="py-3 px-4 text-center flex justify-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(cls)}
                        className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cls.id)}
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
            Belum ada data kelas terdaftar.
          </div>
        )}
      </div>

    </div>
  );
}
