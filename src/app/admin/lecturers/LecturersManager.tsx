// LOG: [POLIMDO GO] Komponen Kelola Dosen (CRUD Lengkap) Admin
'use strict';

'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle, UserCheck, X } from 'lucide-react';

interface Lecturer {
  id: string;
  nip: string;
  name: string;
  email: string;
}

interface LecturersManagerProps {
  initialLecturers: Lecturer[];
  isOffline: boolean;
}

export default function LecturersManager({ initialLecturers, isOffline }: LecturersManagerProps) {
  const [lecturers, setLecturers] = useState<Lecturer[]>(initialLecturers);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nip, setNip] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartEdit = (lecturer: Lecturer) => {
    setEditingId(lecturer.id);
    setNip(lecturer.nip);
    setName(lecturer.name);
    setEmail(lecturer.email);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNip('');
    setName('');
    setEmail('');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nip.trim() || !name.trim() || !email.trim()) {
      return setError('Semua kolom wajib diisi');
    }

    setIsLoading(true);

    if (editingId) {
      if (isOffline) {
        setLecturers(lecturers.map(l => l.id === editingId ? { ...l, nip, name, email } : l));
        setSuccess('Dosen berhasil diupdate (Mode Simulasi).');
        handleCancelEdit();
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/lecturers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, nip, name, email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal mengupdate data.');

        setLecturers(lecturers.map(l => l.id === editingId ? data.lecturer : l));
        setSuccess('Data dosen berhasil diupdate ke Supabase.');
        handleCancelEdit();
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan sistem.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (isOffline) {
      const newLecturer: Lecturer = {
        id: `mock-lecturer-${Date.now()}`,
        nip,
        name,
        email
      };
      setLecturers([newLecturer, ...lecturers]);
      setSuccess('Dosen berhasil ditambahkan (Mode Simulasi).');
      setNip('');
      setName('');
      setEmail('');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/lecturers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nip, name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan data.');

      setLecturers([data.lecturer, ...lecturers]);
      setSuccess('Data dosen berhasil disimpan ke Supabase.');
      setNip('');
      setName('');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dosen ini?')) return;

    setError(null);
    setSuccess(null);

    if (isOffline) {
      setLecturers(lecturers.filter(l => l.id !== id));
      setSuccess('Dosen berhasil dihapus (Mode Simulasi).');
      if (editingId === id) handleCancelEdit();
      return;
    }

    try {
      const res = await fetch(`/api/admin/lecturers?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus data.');

      setLecturers(lecturers.filter(l => l.id !== id));
      setSuccess('Data dosen berhasil dihapus dari database.');
      if (editingId === id) handleCancelEdit();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus dosen.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Form Add / Edit */}
      <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">
              {editingId ? 'Edit Dosen' : 'Tambah Dosen'}
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium">
              {editingId ? 'Update NIP & profil dosen.' : 'Input NIP & akun dosen baru.'}
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
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">NIP</label>
            <input
              type="text"
              required
              placeholder="e.g. 0012038402"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Nama Lengkap & Gelar</label>
            <input
              type="text"
              required
              placeholder="e.g. Prof. Bruce Banner, Ph.D."
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
              placeholder="e.g. dosen2@presensigo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              {editingId ? 'Update Dosen' : 'Tambah Dosen'}
            </button>
          </div>
        </form>
      </div>

      {/* Table List */}
      <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
          <h4 className="font-bold text-zinc-800 text-sm">Daftar Dosen</h4>
          <span className="text-[10px] bg-zinc-100 text-zinc-500 font-bold px-2 py-0.5 rounded-full">{lecturers.length} Orang</span>
        </div>

        {lecturers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-2.5 px-4 font-bold">NIP</th>
                  <th className="py-2.5 px-4 font-bold">Nama Dosen</th>
                  <th className="py-2.5 px-4 font-bold">Email</th>
                  <th className="py-2.5 px-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {lecturers.map((lecturer) => (
                  <tr key={lecturer.id} className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-800 flex items-center gap-2">
                      <div className="p-1 bg-indigo-50 text-indigo-600 rounded">
                        <UserCheck size={14} />
                      </div>
                      {lecturer.nip}
                    </td>
                    <td className="py-3 px-4 text-zinc-900 font-semibold">{lecturer.name}</td>
                    <td className="py-3 px-4 text-zinc-500">{lecturer.email}</td>
                    <td className="py-3 px-4 text-center flex justify-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(lecturer)}
                        className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(lecturer.id)}
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
            Belum ada data dosen terdaftar.
          </div>
        )}
      </div>

    </div>
  );
}
