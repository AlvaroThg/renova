'use client';

import { useTema } from '@/lib/tema';

/** Alterna entre modo oscuro y claro. El estado se guarda por navegador. */
export function BotonTema({ className = '' }: { className?: string }) {
  const { tema, alternar } = useTema();
  const proximo = tema === 'oscuro' ? 'claro' : 'oscuro';

  return (
    <button
      type="button"
      onClick={alternar}
      title={`Cambiar a modo ${proximo}`}
      aria-label={`Cambiar a modo ${proximo}`}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-borde
                  text-texto-tenue transition-colors hover:border-acento hover:text-acento ${className}`}
    >
      {tema === 'oscuro' ? <IconoSol /> : <IconoLuna />}
    </button>
  );
}

function IconoSol() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function IconoLuna() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.8A9 9 0 0 1 11.2 3a7 7 0 1 0 9.8 9.8z" />
    </svg>
  );
}
