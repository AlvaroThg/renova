'use client';

import { createContext, ReactNode, RefObject, useContext, useRef } from 'react';

type RefProgreso = RefObject<number>;

const ContextoProgreso = createContext<RefProgreso | null>(null);

/**
 * Comparte el progreso de scroll (0→1) entre el DOM y la escena 3D.
 *
 * Viaja por ref y no por estado a propósito: con `useState`, cada píxel de
 * scroll re-renderizaría todo el árbol de React Three Fiber 60 veces por
 * segundo. Con una ref, el DOM escribe y `useFrame` lee, sin un solo re-render.
 */
export function ProveedorProgreso({ children }: { children: ReactNode }) {
  const progreso = useRef(0);
  return <ContextoProgreso.Provider value={progreso}>{children}</ContextoProgreso.Provider>;
}

export function useProgresoScroll(): RefProgreso {
  const contexto = useContext(ContextoProgreso);
  if (!contexto) {
    throw new Error('useProgresoScroll debe usarse dentro de <ProveedorProgreso>');
  }
  return contexto;
}
