'use client';

import { EstadoSensor, coloresEstado } from '@renova/shared';
import { useTema } from './tema';

/**
 * Colores de estado del tema activo.
 *
 * Los componentes que solo pintan CSS pueden usar las clases `estado-*` de
 * Tailwind; este hook existe para los que necesitan el hex en JavaScript:
 * los materiales de Three.js y las series de Recharts.
 */
export function useColoresEstado(): Record<EstadoSensor, string> {
  const { tema } = useTema();
  return coloresEstado(tema);
}
