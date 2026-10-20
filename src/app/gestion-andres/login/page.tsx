'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sessionNotice, setSessionNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const reason = params.get('reason');
      if (reason === 'expired' || reason === 'inactivity') {
        setSessionNotice('Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSessionNotice('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.href = '/gestion-andres';
      } else {
        const data = await res.json();
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Acceso Administrador
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-500">
            Ingresa tu contraseña maestra para continuar
          </p>
        </div>

        {sessionNotice && (
          <div className="text-amber-800 text-xs sm:text-sm font-medium bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start sm:items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-lg shrink-0 mt-0.5 sm:mt-0">info</span>
            <span className="flex-1">{sessionNotice}</span>
          </div>
        )}

        <form className="mt-6 sm:mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:z-10 text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-xs sm:text-sm font-medium bg-red-50 border border-red-200 p-3 rounded-xl flex items-start gap-2 break-words text-left">
              <span className="material-symbols-outlined text-red-500 text-lg shrink-0 mt-0.5">error</span>
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? 'Iniciando sesión...' : 'Entrar al Panel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
