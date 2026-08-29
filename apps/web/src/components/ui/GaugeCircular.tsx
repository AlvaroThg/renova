'use client';

import { EstadoSensor, META_VARIABLES, TipoVariable } from '@renova/shared';
import { useColoresEstado } from '@/lib/colores';
import { ChipEstado } from './ChipEstado';

interface Props {
  variable: TipoVariable;
  valor: number | null;
  estado: EstadoSensor;
  onClick?: () => void;
  seleccionado?: boolean;
}

const RADIO = 52;
const GROSOR = 8;
/** Arco de 270°: deja abierta la base, que es donde va la etiqueta. */
const BARRIDO = 270;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;
const LARGO_ARCO = (CIRCUNFERENCIA * BARRIDO) / 360;

/**
 * Gauge circular de una variable de proceso.
 *
 * El relleno del arco lleva el color de estado; el valor y la etiqueta usan
 * tinta normal — el texto nunca se pinta del color del dato, para que siga
 * siendo legible en cualquier estado.
 */
export function GaugeCircular({ variable, valor, estado, onClick, seleccionado }: Props) {
  const meta = META_VARIABLES[variable];
  const color = useColoresEstado()[estado];

  const proporcion =
    valor === null
      ? 0
      : Math.min(
          1,
          Math.max(0, (valor - meta.escala.min) / (meta.escala.max - meta.escala.min)),
        );

  const Contenedor = onClick ? 'button' : 'div';

  return (
    <Contenedor
      {...(onClick ? { onClick, type: 'button' as const } : {})}
      className={`tarjeta flex flex-col items-center gap-2 text-center transition-colors ${
        onClick ? 'hover:border-acento/60' : ''
      } ${seleccionado ? 'border-acento' : ''}`}
    >
      <svg viewBox="0 0 128 128" className="h-28 w-28 -rotate-[225deg]">
        {/* Pista: un paso por encima de la superficie, recesiva. */}
        <circle
          cx="64"
          cy="64"
          r={RADIO}
          fill="none"
          // La pista toma el color de borde del tema activo.
          stroke="rgb(var(--c-borde))"
          strokeWidth={GROSOR}
          strokeLinecap="round"
          strokeDasharray={`${LARGO_ARCO} ${CIRCUNFERENCIA}`}
        />
        <circle
          cx="64"
          cy="64"
          r={RADIO}
          fill="none"
          stroke={color}
          strokeWidth={GROSOR}
          strokeLinecap="round"
          strokeDasharray={`${LARGO_ARCO * proporcion} ${CIRCUNFERENCIA}`}
          style={{ transition: 'stroke-dasharray 600ms ease-out, stroke 400ms ease-out' }}
        />
      </svg>

      {/* La unidad va debajo del valor y no al lado: "0.029 bar" no entra en el
          diámetro interior del arco y se cortaba contra el trazo. */}
      <div className="-mt-[4.9rem] mb-7 leading-none">
        <p className="text-2xl font-semibold text-texto">
          {valor === null ? '—' : valor.toFixed(meta.decimales)}
        </p>
        {meta.unidad && <p className="mt-1 text-[11px] text-texto-tenue">{meta.unidad}</p>}
      </div>

      <p className="text-xs text-texto-tenue">{meta.etiquetaCorta}</p>
      <ChipEstado estado={estado} compacto />
    </Contenedor>
  );
}
