'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { leerToken } from '@/lib/api/client';
import { ProveedorTelemetria } from '@/lib/api/ProveedorTelemetria';
import { BarraLateral } from '@/components/dashboard/BarraLateral';

/**
 * Guard del sistema de gestión.
 *
 * Es una comprobación de cliente, deliberadamente: quien protege los datos es el
 * JwtAuthGuard del backend. Esto solo evita renderizar una pantalla vacía a
 * alguien sin sesión — sin token, la API no devuelve absolutamente nada.
 */
export default function LayoutDashboard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    if (leerToken()) {
      setAutorizado(true);
    } else {
      router.replace('/login');
    }
  }, [router]);

  if (!autorizado) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-texto-tenue">Verificando sesión…</p>
      </div>
    );
  }

  return (
    <ProveedorTelemetria>
      <div className="flex min-h-screen">
        <BarraLateral />
        <div className="flex-1 overflow-x-hidden">{children}</div>
      </div>
    </ProveedorTelemetria>
  );
}
