'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, guardarSesion } from '@/lib/api/client';
import { BotonTema } from '@/components/ui/BotonTema';

export default function PaginaLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@renova.bo');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const sesion = await api.login({ email, password });
      guardarSesion(sesion);
      router.push('/dashboard');
    } catch (e) {
      setError((e as Error).message);
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-mono text-lg font-bold">
            RENOVA
          </Link>
          <BotonTema />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Sistema de gestión y control</h1>
        <p className="mt-2 text-sm text-texto-tenue">
          Acceso al monitoreo del piloto de biogás.
        </p>

        <form onSubmit={enviar} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-texto-tenue">
              Correo
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="campo"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-texto-tenue">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="campo"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-estado-critico/40 bg-estado-critico/10 px-3 py-2 text-sm"
            >
              {error}
            </p>
          )}

          <button type="submit" disabled={enviando} className="boton-primario w-full disabled:opacity-60">
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-6 rounded-lg border border-borde bg-superficie p-3 text-xs leading-relaxed text-texto-debil">
          Demo: las credenciales del operador se crean con el seed y salen de
          <span className="font-mono"> ADMIN_EMAIL</span> y
          <span className="font-mono"> ADMIN_PASSWORD</span> del archivo <span className="font-mono">.env</span>.
        </p>
      </div>
    </main>
  );
}
