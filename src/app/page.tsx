import Link from 'next/link';
import { ShieldCheck, QrCode, MapPin, User, LogIn, GraduationCap } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    const role = session.user.role;
    if (role === 'STUDENT') {
      redirect('/student/dashboard');
    } else if (role === 'LECTURER') {
      redirect('/lecturer/dashboard');
    } else if (role === 'ADMIN') {
      redirect('/admin/dashboard');
    }
  }
  return (
    <div className="flex-1 flex flex-col justify-between py-12 px-6 sm:px-12 md:px-24">
      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl w-full mx-auto mb-16">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Polimdo Go Logo" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">POLIMDO GO</h1>
            <p className="text-xs text-zinc-500 font-medium">Politeknik Negeri Manado</p>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <LogIn size={16} />
          Masuk Ke Sistem
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Hero Text */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold w-max">
              <ShieldCheck size={14} />
              Sistem Presensi MVP Skripsi
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
              Presensi Mahasiswa Berbasis <span className="text-indigo-600">QR Code</span> dan <span className="text-indigo-600">Lokasi</span>
            </h2>
            
            <p className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-lg">
              Sistem presensi digital Politeknik Negeri Manado yang memvalidasi waktu, status sesi, kecocokan QR Code token, dan validasi radius lokasi mahasiswa secara real-time.
            </p>
            
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <QrCode size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-zinc-900">Validasi Token QR Code</h4>
                  <p className="text-xs text-zinc-500">Token acak terenkripsi yang secara dinamis habis masa berlakunya.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-zinc-900">Radius Validation (Haversine)</h4>
                  <p className="text-xs text-zinc-500">Membatasi presensi mahasiswa hanya jika berada dalam area kelas yang diizinkan.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Welcome / Portal Info Card */}
          <div className="lg:col-span-7 flex flex-col gap-6 bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-zinc-100/50">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-zinc-900">Portal Presensi Mahasiswa</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Silakan masuk menggunakan akun yang telah terdaftar untuk melakukan pencatatan kehadiran, mengelola sesi perkuliahan, atau mengunduh laporan presensi kuliah.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl text-white shadow-lg space-y-4">
              <h4 className="font-bold text-base">Sudah memiliki akun?</h4>
              <p className="text-xs text-indigo-100 leading-relaxed">
                Akses sistem presensi terintegrasi menggunakan akun Dosen, Mahasiswa, atau Administrator Politeknik Negeri Manado.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Masuk Ke Aplikasi
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-zinc-100 rounded-xl bg-zinc-50/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Untuk Mahasiswa</span>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  Lakukan pemindaian QR Code dan verifikasi lokasi GPS Anda untuk mengisi daftar kehadiran kelas secara langsung.
                </p>
              </div>
              <div className="p-4 border border-zinc-100 rounded-xl bg-zinc-50/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Untuk Dosen</span>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  Buka sesi perkuliahan baru, generate dynamic token QR Code, pantau kehadiran, serta ekspor laporan presensi berformat PDF.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto mt-16 pt-8 border-t border-zinc-200/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400 font-medium">
        <p>&copy; {new Date().getFullYear()} POLIMDO GO. Hak Cipta Dilindungi.</p>
        <p>Pengembangan Sistem Presensi Mahasiswa Berbasis QR Code & Geolocation - Skripsi Jurusan Elektro POLIMDO</p>
      </footer>
    </div>
  );
}
