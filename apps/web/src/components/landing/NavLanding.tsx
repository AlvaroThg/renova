'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BotonTema } from '@/components/ui/BotonTema';

const SECCIONES = [
  { id: 'problema', etiqueta: 'El problema' },
  { id: 'solucion', etiqueta: 'La solución' },
  { id: 'equipos', etiqueta: 'Los equipos' },
  { id: 'numeros', etiqueta: 'Los números' },
  { id: 'roadmap', etiqueta: 'Roadmap' },
];

export function NavLanding() {
  const [condensada, setCondensada] = useState(false);

  useEffect(() => {
    const alScrollear = () => setCondensada(window.scrollY > 40);
    alScrollear();
    window.addEventListener('scroll', alScrollear, { passive: true });
    return () => window.removeEventListener('scroll', alScrollear);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        condensada ? 'border-b border-borde bg-fondo/85 backdrop-blur-md' : ''
      }`}
    >
      <nav className="contenedor-renova flex h-16 items-center justify-between">
        <Link href="/" className="font-mono text-lg font-bold tracking-tight text-texto">
          RENOVA
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {SECCIONES.map((seccion) => (
            <a
              key={seccion.id}
              href={`#${seccion.id}`}
              className="text-sm text-texto-tenue transition-colors hover:text-acento"
            >
              {seccion.etiqueta}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <BotonTema />
          <Link
            href="/dashboard"
            className="rounded-lg border border-borde px-4 py-2 text-sm font-medium transition-colors hover:border-acento hover:text-acento"
          >
            Ver el sistema
          </Link>
        </div>
      </nav>
    </header>
  );
}
