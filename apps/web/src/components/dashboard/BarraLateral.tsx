'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cerrarSesion, leerUsuario } from '@/lib/api/client';
import { useTelemetriaCompartida } from '@/lib/api/ProveedorTelemetria';
import { BotonTema } from '@/components/ui/BotonTema';

const RUTAS = [
  { href: '/dashboard', etiqueta: 'Vista general' },
  { href: '/dashboard/metricas', etiqueta: 'Métricas en vivo' },
  { href: '/dashboard/produccion', etiqueta: 'Producción' },
  { href: '/dashboard/residuos', etiqueta: 'Residuos' },
  { href: '/dashboard/alertas', etiqueta: 'Alertas' },
  { href: '/dashboard/generadores', etiqueta: 'Generadores' },
];

export function BarraLateral() {
  const ruta = usePathname();
  const router = useRouter();
  const { conectado } = useTelemetriaCompartida();
  const [nombre, setNombre] = useState<string>('');

  useEffect(() => {
    setNombre(leerUsuario()?.nombre ?? '');
  }, []);

  function salir() {
    cerrarSesion();
    router.replace('/login');
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-borde bg-superficie md:flex">
      <div className="border-b border-borde px-5 py-5">
        <Link href="/" className="font-mono text-lg font-bold">
          RENOVA
        </Link>
        <p className="mt-0.5 text-[11px] uppercase tracking-widest text-texto-debil">
          Gestión y control
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {RUTAS.map((item) => {
          const activa = ruta === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                activa
                  ? 'bg-superficie-alta font-medium text-acento'
                  : 'text-texto-tenue hover:bg-superficie-alta hover:text-texto'
              }`}
            >
              {item.etiqueta}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-borde px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-texto-debil">Apariencia</span>
          <BotonTema />
        </div>

        {/* Estado del enlace en vivo: color + texto, nunca solo el punto. */}
        <p className="flex items-center gap-2 text-xs">
          <span
            aria-hidden
            className={`h-2 w-2 rounded-full ${
              conectado ? 'bg-estado-normal animate-pulso-lento' : 'bg-texto-debil'
            }`}
          />
          <span className={conectado ? 'text-texto-tenue' : 'text-texto-debil'}>
            {conectado ? 'Telemetría en vivo' : 'Sin conexión en vivo'}
          </span>
        </p>

        {nombre && <p className="truncate text-xs text-texto-debil">{nombre}</p>}

        <button
          type="button"
          onClick={salir}
          className="text-xs text-texto-tenue underline decoration-borde underline-offset-4 hover:text-acento"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

/** Encabezado reutilizable de cada vista del dashboard. */
export function EncabezadoVista({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-texto-tenue">{descripcion}</p>}
      </div>
      {children}
    </div>
  );
}
