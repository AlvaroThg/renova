/**
 * Constantes del escenario base del piloto RENOVA.
 * Provienen del modelo económico del pitch y son la referencia contra la
 * que el dashboard compara la producción real.
 */

/** Residuo orgánico procesado por día en el escenario base. */
export const RESIDUO_BASE_KG_DIA = 2000;

/**
 * Rendimiento de conversión: 2.000 kg/día → ~350 m³ de biogás/día.
 * Coherente con digestión anaerobia mesofílica de residuo de mercado.
 */
export const FACTOR_BIOGAS_M3_POR_KG = 0.175;

/** Producción objetivo diaria de biogás en el escenario base. */
export const BIOGAS_BASE_M3_DIA = RESIDUO_BASE_KG_DIA * FACTOR_BIOGAS_M3_POR_KG; // 350

/** Precio de venta del biogás en bolivianos por m³. */
export const PRECIO_BS_POR_M3 = 2;

/** Ingreso mensual del escenario base: 350 m³ × 30 días × Bs 2 = Bs 21.000. */
export const INGRESO_BASE_BS_MES = BIOGAS_BASE_M3_DIA * 30 * PRECIO_BS_POR_M3;

/** Rutas de los modelos 3D servidos desde /public. */
export const MODELOS_3D = {
  planta: '/models/planta-biogas.glb',
  biodigestor: '/models/biodigestor-tubular.glb',
  gasometro: '/models/gasometro-biogas.glb',
} as const;

/** Amarillo-verde lima de marca, el mismo de los modelos 3D. */
export const COLOR_ACENTO = '#D4F84A';

/**
 * Color de las series de datos, por tema.
 *
 * En oscuro es el lima de marca. En claro no puede serlo: sobre blanco tiene
 * 1,17:1 de contraste, invisible. Y su versión oscura (oliva) es indistinguible
 * del naranja de alerta en deuteranopía, así que la serie clara cambia de familia
 * a un azul que sí separa de los tres colores de estado (ΔE 17–21 en CVD).
 */
export const COLOR_SERIE_OSCURO = COLOR_ACENTO;
export const COLOR_SERIE_CLARO = '#2A6E9E';
