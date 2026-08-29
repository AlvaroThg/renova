'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import type { Tema } from '@renova/shared';

const CLAVE = 'renova.tema';

interface ContextoTema {
  tema: Tema;
  alternar: () => void;
  fijar: (tema: Tema) => void;
}

const Contexto = createContext<ContextoTema | null>(null);

/**
 * Script que corre antes del primer pintado.
 *
 * Sin esto, la página arranca siempre en el tema por defecto y salta al elegido
 * cuando React hidrata: un destello blanco en modo oscuro, que es justo lo que
 * el modo oscuro existe para evitar.
 */
export const SCRIPT_TEMA_INICIAL = `
(function () {
  try {
    var guardado = localStorage.getItem('${CLAVE}');
    var sistema = window.matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'oscuro';
    document.documentElement.dataset.tema = guardado === 'claro' || guardado === 'oscuro' ? guardado : sistema;
  } catch (e) {
    document.documentElement.dataset.tema = 'oscuro';
  }
})();
`;

export function ProveedorTema({ children }: { children: ReactNode }) {
  // Arranca en oscuro y se corrige en el efecto: el valor real ya lo puso el
  // script de arriba en el DOM, así el servidor y el cliente coinciden al hidratar.
  const [tema, setTema] = useState<Tema>('oscuro');

  useEffect(() => {
    const actual = document.documentElement.dataset.tema;
    if (actual === 'claro' || actual === 'oscuro') setTema(actual);
  }, []);

  const fijar = useCallback((nuevo: Tema) => {
    setTema(nuevo);
    document.documentElement.dataset.tema = nuevo;
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {
      // Modo privado o almacenamiento bloqueado: el tema vale para esta sesión.
    }
  }, []);

  const alternar = useCallback(
    () => fijar(tema === 'oscuro' ? 'claro' : 'oscuro'),
    [tema, fijar],
  );

  return <Contexto.Provider value={{ tema, alternar, fijar }}>{children}</Contexto.Provider>;
}

export function useTema(): ContextoTema {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useTema requiere <ProveedorTema>');
  return contexto;
}
