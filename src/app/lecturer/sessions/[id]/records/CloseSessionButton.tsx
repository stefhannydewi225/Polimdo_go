// LOG: [POLIMDO GO] Komponen Client Tombol Tutup Sesi Presensi Dosen
'use strict';

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PowerOff, Loader2 } from 'lucide-react';

interface CloseSessionButtonProps {
  id: string;
  isOffline: boolean;
}

export default function CloseSessionButton({ id, isOffline }: CloseSessionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = async () => {
    if (!confirm('Apakah Anda yakin ingin menutup sesi presensi ini? Mahasiswa tidak akan dapat mengirim presensi lagi.')) {
      return;
    }
    
    setIsLoading(true);

    if (isOffline) {
      alert('Sesi berhasil ditutup (Mode Simulasi).');
      router.refresh();
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/sessions/${id}/close`, {
        method: 'POST'
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        router.refresh();
      } else {
        alert(data.message || 'Gagal menutup sesi.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClose}
      disabled={isLoading}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
      title="Tutup Sesi"
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <PowerOff size={14} />
      )}
      Tutup Sesi Presensi
    </button>
  );
}
