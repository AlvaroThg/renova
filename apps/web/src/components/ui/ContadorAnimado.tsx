'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface Props {
  valor: number;
  decimales?: number;
  prefijo?: string;
  sufijo?: string;
  duracionMs?: number;
}

/**
 * Contador que cuenta desde 0 al entrar en pantalla.
 *
 * Usa easing "out" en vez de lineal: el número frena al final, que es lo que
 * hace que se lea como un dato que aterriza y no como un cronómetro.
 */
export function ContadorAnimado({
  valor,
  decimales = 0,
  prefijo = '',
  sufijo = '',
  duracionMs = 1600,
}: Props) {
  const referencia = useRef<HTMLSpanElement>(null);
  const visible = useInView(referencia, { once: true, margin: '-20%' });
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (!visible) return;

    // prefers-reduced-motion: mostrar el número final sin animar.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActual(valor);
      return;
    }

    let cuadro = 0;
    const inicio = performance.now();

    const avanzar = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracionMs);
      const suavizado = 1 - Math.pow(1 - t, 3);
      setActual(valor * suavizado);
      if (t < 1) cuadro = requestAnimationFrame(avanzar);
    };

    cuadro = requestAnimationFrame(avanzar);
    return () => cancelAnimationFrame(cuadro);
  }, [visible, valor, duracionMs]);

  return (
    <span ref={referencia}>
      {prefijo}
      {actual.toLocaleString('es-BO', {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
      })}
      {sufijo}
    </span>
  );
}
