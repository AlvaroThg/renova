/**
 * Estado operativo de una variable según su rango de digestión mesofílica.
 * El mismo valor alimenta el color del gauge y la prop `statusColor`
 * del componente Model3D en el dashboard.
 */
export const ESTADOS_SENSOR = ['normal', 'alerta', 'critico'] as const;
export type EstadoSensor = (typeof ESTADOS_SENSOR)[number];

/** Severidad de una alerta registrada — refleja el estado que la disparó. */
export const SEVERIDADES = ['alerta', 'critico'] as const;
export type Severidad = (typeof SEVERIDADES)[number];

export type Tema = 'claro' | 'oscuro';

/**
 * Colores de estado, validados por separado para cada tema.
 *
 * No son el mismo color con la luminosidad invertida: cada set se eligió y se
 * midió contra la superficie sobre la que realmente se dibuja (#101410 en
 * oscuro, #FBFBF8 en claro) y contra el color de serie de ese tema.
 *
 * En oscuro se descartó el amarillo obvio para "alerta" (#FACC15): está a
 * ΔE 5.7 del lima de marca en deuteranopía, así que un operador daltónico no
 * distinguiría una alerta de un elemento decorativo. El naranja lo lleva a 20.7.
 *
 * Verde↔rojo sigue siendo confundible en deuteranopía — es inevitable en
 * cualquier semáforo — por eso ningún estado se muestra nunca solo con color:
 * siempre lleva ícono y etiqueta al lado.
 */
export const COLOR_ESTADO_OSCURO: Record<EstadoSensor, string> = {
  normal: '#4ADE80',
  alerta: '#E8842A',
  critico: '#E3344E',
};

export const COLOR_ESTADO_CLARO: Record<EstadoSensor, string> = {
  normal: '#17924F',
  alerta: '#D07A16',
  critico: '#A3182F',
};

export function coloresEstado(tema: Tema): Record<EstadoSensor, string> {
  return tema === 'claro' ? COLOR_ESTADO_CLARO : COLOR_ESTADO_OSCURO;
}

/** Compatibilidad: el set oscuro es el tema por defecto de la plataforma. */
export const COLOR_ESTADO = COLOR_ESTADO_OSCURO;

export const ETIQUETA_ESTADO: Record<EstadoSensor, string> = {
  normal: 'Normal',
  alerta: 'En alerta',
  critico: 'Crítico',
};

/** Segundo canal de codificación, obligatorio junto al color. */
export const ICONO_ESTADO: Record<EstadoSensor, string> = {
  normal: '●',
  alerta: '▲',
  critico: '■',
};

/** Prioridad para ordenar: el peor estado de un conjunto manda sobre el resto. */
const PESO_ESTADO: Record<EstadoSensor, number> = {
  normal: 0,
  alerta: 1,
  critico: 2,
};

/** Devuelve el estado más severo de una lista (para el color de una zona 3D completa). */
export function peorEstado(estados: readonly EstadoSensor[]): EstadoSensor {
  return estados.reduce<EstadoSensor>(
    (peor, actual) => (PESO_ESTADO[actual] > PESO_ESTADO[peor] ? actual : peor),
    'normal',
  );
}
