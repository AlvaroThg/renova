'use client';

import { createContext, ReactNode, useContext } from 'react';
import { EstadoTelemetria, useTelemetria } from './useTelemetria';

const Contexto = createContext<EstadoTelemetria | null>(null);

/**
 * Abre UNA sola conexión de telemetría para todo el dashboard.
 *
 * Si cada vista llamara a useTelemetria por su cuenta, navegar entre pestañas
 * abriría y cerraría sockets todo el tiempo y se perderían lecturas en cada salto.
 */
export function ProveedorTelemetria({ children }: { children: ReactNode }) {
  const estado = useTelemetria();
  return <Contexto.Provider value={estado}>{children}</Contexto.Provider>;
}

export function useTelemetriaCompartida(): EstadoTelemetria {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error('useTelemetriaCompartida requiere <ProveedorTelemetria>');
  }
  return contexto;
}
