'use client';

import { useEffect, useState } from 'react';

export type DisponibilidadModelo = 'verificando' | 'disponible' | 'ausente';

/** Cache por sesión: no tiene sentido re-preguntar por el mismo .glb en cada montaje. */
const cache = new Map<string, DisponibilidadModelo>();

/**
 * Comprueba con un HEAD si el .glb existe en /public/models antes de intentar cargarlo.
 *
 * Sin esto, un archivo faltante hace que useGLTF suspenda para siempre o lance
 * dentro del árbol de R3F. Con esto, el componente cae limpiamente a la geometría
 * procedural y toda la plataforma funciona antes de tener los modelos exportados.
 */
export function useModeloDisponible(ruta: string): DisponibilidadModelo {
  const [estado, setEstado] = useState<DisponibilidadModelo>(
    () => cache.get(ruta) ?? 'verificando',
  );

  useEffect(() => {
    const cacheado = cache.get(ruta);
    if (cacheado) {
      setEstado(cacheado);
      return;
    }

    let vigente = true;
    fetch(ruta, { method: 'HEAD' })
      .then((res) => {
        // Next devuelve 200 con HTML para rutas no encontradas en algunos modos,
        // así que también se exige que el content-type no sea texto.
        const tipo = res.headers.get('content-type') ?? '';
        return res.ok && !tipo.includes('text/html') ? 'disponible' : 'ausente';
      })
      .catch(() => 'ausente' as const)
      .then((resultado) => {
        cache.set(ruta, resultado as DisponibilidadModelo);
        if (vigente) setEstado(resultado as DisponibilidadModelo);
      });

    return () => {
      vigente = false;
    };
  }, [ruta]);

  return estado;
}
