// LOG: [POLIMDO GO] Client Component untuk Mengelola Log Kehadiran Mahasiswa (Tambah, Edit, Hapus, Izin, Sakit) & Print
'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Plus, 
  Printer, 
  Search, 
  Loader2, 
  AlertCircle,
  FileSpreadsheet,
  X,
  Check,
  Calendar,
  Frown,
  Edit2
} from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: string;
  nim: string;
  user: {
    name: string;
  };
}

interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  checkedInAt: string | Date;
  studentLatitude: number | null;
  studentLongitude: number | null;
  distanceMeters: number | null;
  status: 'VALID' | 'REJECTED' | 'SICK' | 'PERMISSION';
  rejectionReason: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  student: {
    nim: string;
    user: {
      name: string;
    };
  };
}

interface AttendanceRecordsManagerProps {
  sessionId: string;
  initialRecords: AttendanceRecord[];
  classStudents: Student[];
  isOffline: boolean;
}

export default function AttendanceRecordsManager({
  sessionId,
  initialRecords,
  classStudents,
  isOffline
}: AttendanceRecordsManagerProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for Add Manual Attendance Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [newRecordStatus, setNewRecordStatus] = useState<'VALID' | 'SICK' | 'PERMISSION' | 'REJECTED'>('VALID');
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // States for Inline Edit
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<'VALID' | 'SICK' | 'PERMISSION' | 'REJECTED' | ''>('');

  // 1. Hitung Statistik Real-time
  const stats = {
    hadir: records.filter(r => r.status === 'VALID').length,
    sakit: records.filter(r => r.status === 'SICK').length,
    izin: records.filter(r => r.status === 'PERMISSION').length,
    ditolak: records.filter(r => r.status === 'REJECTED').length,
    // Alpa = total mahasiswa terdaftar di kelas dikurangi mahasiswa yang sudah memiliki log dengan status VALID, SICK, atau PERMISSION (atau data log sama sekali)
    alpa: Math.max(0, classStudents.length - records.filter(r => ['VALID', 'SICK', 'PERMISSION'].includes(r.status)).length)
  };

  // 2. Cari mahasiswa yang belum absen (belum ada record) untuk dropdown
  const enrolledStudentIds = new Set(records.map(r => r.studentId));
  const unrecordedStudents = classStudents.filter(s => !enrolledStudentIds.has(s.id));

  // 3. Cari & Filter Log di Tabel
  const filteredRecords = records.filter(rec => 
    rec.student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.student.nim.includes(searchTerm)
  );

  // 4. Aksi Tambah Kehadiran Manual
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setErrorMessage('Pilih mahasiswa terlebih dahulu.');
      return;
    }

    setActionLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/sessions/${sessionId}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          status: newRecordStatus
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal menambahkan data.');
      }

      // Add to records state
      let addedRecord = data.record;
      
      // Offline fallback mapping if needed
      if (isOffline || !addedRecord.student) {
        const studentInfo = classStudents.find(s => s.id === selectedStudentId);
        addedRecord = {
          id: data.record.id || `mock-${Date.now()}`,
          sessionId,
          studentId: selectedStudentId,
          checkedInAt: new Date().toISOString(),
          studentLatitude: null,
          studentLongitude: null,
          distanceMeters: null,
          status: newRecordStatus,
          rejectionReason: null,
          userAgent: 'Manual oleh Dosen (Simulasi)',
          ipAddress: '127.0.0.1',
          student: {
            nim: studentInfo?.nim || '',
            user: { name: studentInfo?.user.name || 'User' }
          }
        };
      }

      setRecords([addedRecord, ...records]);
      setShowAddModal(false);
      setSelectedStudentId('');
      setNewRecordStatus('VALID');
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Aksi Simpan Edit Status
  const handleSaveStatus = async (recordId: string) => {
    if (!editingStatus) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/records`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          status: editingStatus
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal memperbarui status.');
      }

      // Update state
      setRecords(records.map(r => {
        if (r.id === recordId) {
          return {
            ...r,
            status: editingStatus,
            rejectionReason: editingStatus === 'REJECTED' ? 'INVALID_TOKEN' : null
          };
        }
        return r;
      }));

      setEditingRecordId(null);
      setEditingStatus('');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pembaruan.');
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Aksi Hapus Log Kehadiran
  const handleDeleteRecord = async (recordId: string, studentName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data kehadiran untuk ${studentName}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/records`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal menghapus data.');
      }

      // Remove from state
      setRecords(records.filter(r => r.id !== recordId));
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus data.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string, reason: string | null) => {
    switch (status) {
      case 'VALID':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
            <CheckCircle size={10} />
            Hadir
          </span>
        );
      case 'SICK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
            <Calendar size={10} />
            Sakit
          </span>
        );
      case 'PERMISSION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
            <Calendar size={10} />
            Izin
          </span>
        );
      case 'REJECTED':
      default:
        let text = 'Ditolak';
        if (reason === 'OUT_OF_RADIUS') text = 'Luar Radius';
        if (reason === 'QR_EXPIRED') text = 'Expired';
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold rounded-full uppercase tracking-wider" title={reason || 'Ditolak'}>
            <XCircle size={10} />
            {text}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Ringkasan & Statistik */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-sm text-center">
          <span className="text-[10px] text-zinc-400 font-bold uppercase block tracking-wider mb-1">Total Kelas</span>
          <span className="text-2xl font-extrabold text-zinc-800">{classStudents.length}</span>
          <span className="text-[9px] text-zinc-400 block mt-0.5 font-medium">Mahasiswa</span>
        </div>
        <div className="bg-green-50 border border-green-200/50 rounded-xl p-3.5 shadow-sm text-center">
          <span className="text-[10px] text-green-700 font-bold uppercase block tracking-wider mb-1">Hadir</span>
          <span className="text-2xl font-extrabold text-green-800">{stats.hadir}</span>
          <span className="text-[9px] text-green-500 block mt-0.5 font-medium">Mahasiswa</span>
        </div>
        <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-3.5 shadow-sm text-center">
          <span className="text-[10px] text-amber-700 font-bold uppercase block tracking-wider mb-1">Sakit</span>
          <span className="text-2xl font-extrabold text-amber-800">{stats.sakit}</span>
          <span className="text-[9px] text-amber-500 block mt-0.5 font-medium">Mahasiswa</span>
        </div>
        <div className="bg-indigo-50 border border-indigo-200/50 rounded-xl p-3.5 shadow-sm text-center">
          <span className="text-[10px] text-indigo-700 font-bold uppercase block tracking-wider mb-1">Izin</span>
          <span className="text-2xl font-extrabold text-indigo-800">{stats.izin}</span>
          <span className="text-[9px] text-indigo-500 block mt-0.5 font-medium">Mahasiswa</span>
        </div>
        <div className="bg-rose-50 border border-rose-200/50 rounded-xl p-3.5 shadow-sm text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-rose-700 font-bold uppercase block tracking-wider mb-1">Alfa / Belum Absen</span>
          <span className="text-2xl font-extrabold text-rose-800">{stats.alpa}</span>
          <span className="text-[9px] text-rose-500 block mt-0.5 font-medium">Mahasiswa</span>
        </div>
      </div>

      {/* 2. Toolbar & Controls */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari nama atau NIM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-zinc-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} />
            Tambah Manual
          </button>
          
          <Link
            href={`/lecturer/sessions/${sessionId}/print`}
            target="_blank"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-950 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Printer size={16} />
            Ekspor PDF Laporan
          </Link>
        </div>
      </div>

      {/* 3. Log Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h4 className="font-bold text-zinc-800 text-xs uppercase tracking-wider">Log Validasi Kehadiran Mahasiswa</h4>
          <span className="text-[10px] text-zinc-400 font-semibold">Tampil: {filteredRecords.length} dari {records.length} data</span>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-3 px-4 font-bold">Mahasiswa</th>
                  <th className="py-3 px-4 font-bold">Waktu Absen</th>
                  <th className="py-3 px-4 font-bold">Jarak GPS</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-center">Aksi Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredRecords.map((rec) => {
                  const checkInDate = new Date(rec.checkedInAt).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'Asia/Makassar'
                  });
                  const checkInTime = new Date(rec.checkedInAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'Asia/Makassar'
                  });
                  const isEditing = editingRecordId === rec.id;

                  return (
                    <tr key={rec.id} className="hover:bg-zinc-50/55 transition-colors">
                      {/* Name & NIM */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-zinc-900">{rec.student.user.name}</p>
                        <p className="text-[10px] text-zinc-400 font-semibold tracking-wider">NIM: {rec.student.nim}</p>
                      </td>
                      
                      {/* Checked in time */}
                      <td className="py-3 px-4 text-zinc-500 font-medium space-y-0.5">
                        <p className="font-semibold text-zinc-700">{checkInDate}</p>
                        <p className="text-[10px] text-zinc-400 font-semibold">{checkInTime} WITA</p>
                      </td>
                      
                      {/* Distance */}
                      <td className="py-3 px-4 font-bold text-zinc-800">
                        {rec.distanceMeters !== null ? `${rec.distanceMeters.toFixed(1)} m` : '-'}
                      </td>
                      
                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value as any)}
                            className="text-[11px] p-1 border border-zinc-300 rounded font-semibold text-zinc-800 outline-none bg-white"
                          >
                            <option value="VALID">HADIR</option>
                            <option value="SICK">SAKIT</option>
                            <option value="PERMISSION">IZIN</option>
                            <option value="REJECTED">DITOLAK / ALPA</option>
                          </select>
                        ) : (
                          getStatusBadge(rec.status, rec.rejectionReason)
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveStatus(rec.id)}
                                disabled={actionLoading}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Simpan Status"
                              >
                                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingRecordId(null);
                                  setEditingStatus('');
                                }}
                                className="p-1 text-zinc-400 hover:bg-zinc-50 rounded transition-colors"
                                title="Batal"
                              >
                                <X size={15} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingRecordId(rec.id);
                                  setEditingStatus(rec.status);
                                }}
                                className="p-1 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                title="Ubah Status"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(rec.id, rec.student.user.name)}
                                disabled={actionLoading}
                                className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Hapus Log"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-zinc-400 flex flex-col items-center justify-center gap-1.5">
            <Frown size={28} className="text-zinc-300" />
            <p className="text-xs font-semibold text-zinc-500">Tidak ada log presensi mahasiswa ditemukan</p>
            <p className="text-[10px] text-zinc-400">Silakan cari kata kunci lain atau tambahkan presensi manual.</p>
          </div>
        )}
      </div>

      {/* 4. MODAL: Tambah Kehadiran Manual */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-zinc-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
              <h3 className="font-extrabold text-zinc-950 text-sm">Tambah Kehadiran Manual</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-800 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddManual} className="mt-4 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex gap-2 text-red-700 text-xs font-medium">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Student Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Pilih Mahasiswa</label>
                {unrecordedStudents.length > 0 ? (
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-800 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  >
                    <option value="">-- Pilih Mahasiswa Kelas --</option>
                    {unrecordedStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.user.name} ({student.nim})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2.5 border border-amber-100 rounded-lg font-medium">
                    Semua mahasiswa di kelas ini sudah terdaftar dalam log kehadiran sesi.
                  </p>
                )}
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Status Kehadiran</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'VALID', label: 'Hadir', desc: 'Hadir kelas manual' },
                    { val: 'SICK', label: 'Sakit', desc: 'Keterangan Sakit' },
                    { val: 'PERMISSION', label: 'Izin', desc: 'Dispensasi / Izin' },
                    { val: 'REJECTED', label: 'Ditolak / Alpa', desc: 'Tanpa Keterangan' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setNewRecordStatus(opt.val as any)}
                      className={`p-2.5 border rounded-xl text-left transition-all ${
                        newRecordStatus === opt.val
                          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                          : 'border-zinc-200 hover:bg-zinc-50 bg-white'
                      }`}
                    >
                      <p className="text-xs font-bold text-zinc-800">{opt.label}</p>
                      <p className="text-[9px] text-zinc-400 font-semibold">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || unrecordedStudents.length === 0}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
