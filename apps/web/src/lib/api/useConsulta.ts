'use client';

import { useCallback, useEffect, useState } from 'react';

interface Consulta<T> {
  datos: T | null;
  cargando: boolean;
  error: string | null;
  recargar: () => void;
}

/**
 * Fetch declarativo mínimo para las vistas del dashboard.
 *
 * No se usa react-query a propósito: las pantallas hacen una consulta cada una
 * y el dato que cambia rápido llega por WebSocket, no por polling. Traer una
 * librería de caché acá sería peso sin beneficio.
 */
export function useConsulta<T>(
  consultar: () => Promise<T>,
  dependencias: unknown[] = [],
): Consulta<T> {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);

    consultar()
      .then((resultado) => {
        if (vigente) setDatos(resultado);
      })
      .catch((e: Error) => {
        if (vigente) setError(e.message);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, version]);

  return { datos, cargando, error, recargar };
}
