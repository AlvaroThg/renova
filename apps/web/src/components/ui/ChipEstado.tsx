'use client';

import { ETIQUETA_ESTADO, EstadoSensor, ICONO_ESTADO } from '@renova/shared';
import { useColoresEstado } from '@/lib/colores';

/**
 * Indicador de estado con color + ícono + texto.
 *
 * Los tres canales van siempre juntos por decisión de accesibilidad: verde y rojo
 * son indistinguibles en deuteranopía, así que el color nunca puede ser lo único
 * que comunica el estado de la planta.
 */
export function ChipEstado({
  estado,
  compacto = false,
}: {
  estado: EstadoSensor;
  compacto?: boolean;
}) {
  const color = useColoresEstado()[estado];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium ${
        compacto ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
      style={{ borderColor: `${color}55`, backgroundColor: `${color}14` }}
    >
      <span aria-hidden style={{ color }} className="text-[10px] leading-none">
        {ICONO_ESTADO[estado]}
      </span>
      <span className="text-texto">{ETIQUETA_ESTADO[estado]}</span>
    </span>
  );
}
