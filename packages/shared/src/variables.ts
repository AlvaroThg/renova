/**
 * Variables de proceso monitoreadas en el biodigestor.
 * Única fuente de verdad compartida entre el backend (dominio + simulador)
 * y el frontend (gauges, gráficos, zonas del modelo 3D).
 */
export const TIPOS_VARIABLE = [
  'temperatura',
  'ph',
  'presion',
  'humedad',
  'ch4',
  'co2',
  'h2s',
] as const;

export type TipoVariable = (typeof TIPOS_VARIABLE)[number];

/** Zonas físicas de la planta a las que se asocia cada sensor. */
export const ZONAS = ['biodigestor', 'gasometro'] as const;
export type Zona = (typeof ZONAS)[number];

export interface MetaVariable {
  tipo: TipoVariable;
  etiqueta: string;
  /** Versión corta para espacios angostos (gauges, ejes) — evita que envuelva. */
  etiquetaCorta: string;
  unidad: string;
  /** Zona de la planta que se resalta en el modelo 3D al seleccionar la variable. */
  zona: Zona;
  /** Rango del gauge circular (no es el rango operativo, es la escala visual). */
  escala: { min: number; max: number };
  /** Decimales a mostrar en la UI. */
  decimales: number;
}

export const META_VARIABLES: Record<TipoVariable, MetaVariable> = {
  temperatura: {
    tipo: 'temperatura',
    etiqueta: 'Temperatura',
    etiquetaCorta: 'Temperatura',
    unidad: '°C',
    zona: 'biodigestor',
    escala: { min: 20, max: 50 },
    decimales: 1,
  },
  ph: {
    tipo: 'ph',
    etiqueta: 'pH',
    etiquetaCorta: 'pH',
    unidad: '',
    zona: 'biodigestor',
    escala: { min: 5, max: 9 },
    decimales: 2,
  },
  presion: {
    tipo: 'presion',
    etiqueta: 'Presión',
    etiquetaCorta: 'Presión',
    unidad: 'bar',
    zona: 'gasometro',
    escala: { min: 0, max: 0.1 },
    decimales: 3,
  },
  humedad: {
    tipo: 'humedad',
    etiqueta: 'Humedad',
    etiquetaCorta: 'Humedad',
    unidad: '%',
    zona: 'biodigestor',
    escala: { min: 40, max: 90 },
    decimales: 1,
  },
  ch4: {
    tipo: 'ch4',
    etiqueta: 'Metano (CH₄)',
    etiquetaCorta: 'CH₄',
    unidad: '%',
    zona: 'gasometro',
    escala: { min: 0, max: 100 },
    decimales: 1,
  },
  co2: {
    tipo: 'co2',
    etiqueta: 'Dióxido de carbono (CO₂)',
    etiquetaCorta: 'CO₂',
    unidad: '%',
    zona: 'gasometro',
    escala: { min: 0, max: 60 },
    decimales: 1,
  },
  h2s: {
    tipo: 'h2s',
    etiqueta: 'Sulfuro de hidrógeno (H₂S)',
    etiquetaCorta: 'H₂S',
    unidad: 'ppm',
    zona: 'gasometro',
    escala: { min: 0, max: 800 },
    decimales: 0,
  },
};

export function esTipoVariable(valor: string): valor is TipoVariable {
  return (TIPOS_VARIABLE as readonly string[]).includes(valor);
}
