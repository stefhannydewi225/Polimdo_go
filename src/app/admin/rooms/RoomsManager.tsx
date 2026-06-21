// LOG: [POLIMDO GO] Komponen Kelola Ruangan dan Lokasi GPS Admin (CRUD Lengkap)
'use strict';

'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Edit2, AlertCircle, CheckCircle, X } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  defaultRadiusMeters: number;
}

interface RoomsManagerProps {
  initialRooms: Room[];
  isOffline: boolean;
}

export default function RoomsManager({ initialRooms, isOffline }: RoomsManagerProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('50');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartEdit = (room: Room) => {
    setEditingId(room.id);
    setName(room.name);
    setLatitude(room.latitude.toString());
    setLongitude(room.longitude.toString());
    setRadius(room.defaultRadiusMeters.toString());
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setLatitude('');
    setLongitude('');
    setRadius('50');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    const radNum = Number(radius);

    if (!name.trim()) return setError('Nama ruangan wajib diisi');
    if (isNaN(latNum) || latNum < -90 || latNum > 90) return setError('Latitude tidak valid (-90 s.d 90)');
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) return setError('Longitude tidak valid (-180 s.d 180)');
    if (isNaN(radNum) || radNum < 5) return setError('Radius minimal 5 meter');

    setIsLoading(true);

    if (editingId) {
      if (isOffline) {
        setRooms(rooms.map(r => r.id === editingId ? { ...r, name, latitude: latNum, longitude: lngNum, defaultRadiusMeters: radNum } : r));
        setSuccess('Ruangan berhasil diupdate (Mode Simulasi).');
        handleCancelEdit();
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/rooms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, name, latitude: latNum, longitude: lngNum, defaultRadiusMeters: radNum }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal mengupdate data.');
        
        setRooms(rooms.map(r => r.id === editingId ? data.room : r));
        setSuccess('Ruangan berhasil diupdate ke database Supabase.');
        handleCancelEdit();
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan sistem.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Aksi Create
    if (isOffline) {
      const newRoom: Room = {
        id: `mock-room-${Date.now()}`,
        name,
        latitude: latNum,
        longitude: lngNum,
        defaultRadiusMeters: radNum
      };
      setRooms([newRoom, ...rooms]);
      setSuccess('Ruangan berhasil ditambahkan (Mode Simulasi).');
      setName('');
      setLatitude('');
      setLongitude('');
      setRadius('50');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, latitude: latNum, longitude: lngNum, defaultRadiusMeters: radNum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan data.');
      
      setRooms([data.room, ...rooms]);
      setSuccess('Ruangan berhasil disimpan ke database Supabase.');
      setName('');
      setLatitude('');
      setLongitude('');
      setRadius('50');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ruangan ini?')) return;

    setError(null);
    setSuccess(null);

    if (isOffline) {
      setRooms(rooms.filter(r => r.id !== id));
      setSuccess('Ruangan berhasil dihapus (Mode Simulasi).');
      if (editingId === id) handleCancelEdit();
      return;
    }

    try {
      const res = await fetch(`/api/admin/rooms?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus data.');

      setRooms(rooms.filter(r => r.id !== id));
      setSuccess('Ruangan berhasil dihapus dari database.');
      if (editingId === id) handleCancelEdit();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus ruangan.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Sisi Kiri - Form Add / Edit */}
      <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">
              {editingId ? 'Edit Ruangan' : 'Tambah Ruangan'}
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium">
              {editingId ? 'Update koordinat & radius ruangan.' : 'Definisikan titik koordinat GPS baru.'}
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
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Nama Ruangan / Lab</label>
            <input
              type="text"
              required
              placeholder="e.g. Lab RPL 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Latitude</label>
            <input
              type="text"
              required
              placeholder="e.g. 1.479585"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Longitude</label>
            <input
              type="text"
              required
              placeholder="e.g. 124.897003"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Default Radius (Meter)</label>
            <input
              type="number"
              required
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
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
              {editingId ? 'Update Ruangan' : 'Simpan Ruangan'}
            </button>
          </div>
        </form>
      </div>

      {/* Sisi Kanan - Daftar Ruangan */}
      <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
          <h4 className="font-bold text-zinc-800 text-sm">Daftar Ruangan Terdaftar</h4>
          <span className="text-[10px] bg-zinc-100 text-zinc-500 font-bold px-2 py-0.5 rounded-full">{rooms.length} Ruang</span>
        </div>

        {rooms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-2.5 px-4 font-bold">Ruangan</th>
                  <th className="py-2.5 px-4 font-bold">Titik Koordinat (Lat, Lng)</th>
                  <th className="py-2.5 px-4 font-bold text-center">Default Radius</th>
                  <th className="py-2.5 px-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-zinc-50/50">
                    <td className="py-3 px-4 font-bold text-zinc-800 flex items-center gap-2">
                      <div className="p-1 bg-indigo-50 text-indigo-600 rounded">
                        <MapPin size={14} />
                      </div>
                      {room.name}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                      {room.latitude.toFixed(6)}, {room.longitude.toFixed(6)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-zinc-700">
                      {room.defaultRadiusMeters} m
                    </td>
                    <td className="py-3 px-4 text-center flex justify-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(room)}
                        className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
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
            Belum ada ruangan terdaftar.
          </div>
        )}
      </div>

    </div>
  );
}
