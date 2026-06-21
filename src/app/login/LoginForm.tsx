// LOG: [POLIMDO GO] Komponen Form Login Client-Side
'use strict';

'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        // Redirect ke root, middleware akan mengarahkan ke dashboard yang sesuai
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
          Email / NIM
        </label>
        <input
          type="email"
          required
          placeholder="mhs1@presensigo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
          Password
        </label>
        <input
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            <LogIn size={16} />
            Masuk
          </>
        )}
      </button>
    </form>
  );
}
