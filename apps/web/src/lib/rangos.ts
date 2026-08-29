import { TipoVariable } from '@renova/shared';

/**
 * Rangos óptimos replicados para la UI (bandas de referencia y gauges).
 *
 * La autoridad sigue siendo `RANGOS_OPERATIVOS` en el dominio del backend: acá
 * solo se dibuja. Si un umbral cambia allá, el estado que llega por WebSocket ya
 * viene calculado correctamente; esto solo mueve la banda gris del gráfico.
 */
export interface RangoUI {
  optimoMin: number;
  optimoMax: number;
  alertaMin: number;
  alertaMax: number;
}

export const RANGOS_UI: Record<TipoVariable, RangoUI> = {
  temperatura: { optimoMin: 33, optimoMax: 37, alertaMin: 30, alertaMax: 40 },
  ph: { optimoMin: 6.8, optimoMax: 7.2, alertaMin: 6.5, alertaMax: 7.5 },
  presion: { optimoMin: 0.02, optimoMax: 0.05, alertaMin: 0.01, alertaMax: 0.07 },
  humedad: { optimoMin: 60, optimoMax: 70, alertaMin: 55, alertaMax: 75 },
  ch4: { optimoMin: 55, optimoMax: 70, alertaMin: 50, alertaMax: 80 },
  co2: { optimoMin: 25, optimoMax: 40, alertaMin: 20, alertaMax: 45 },
  h2s: { optimoMin: 0, optimoMax: 200, alertaMin: 0, alertaMax: 500 },
};
