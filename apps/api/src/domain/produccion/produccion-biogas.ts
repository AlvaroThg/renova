import {
  BIOGAS_BASE_M3_DIA,
  FACTOR_BIOGAS_M3_POR_KG,
  PRECIO_BS_POR_M3,
} from '@renova/shared';

/**
 * Reglas de conversión del modelo económico del piloto.
 *
 * 2.000 kg/día de residuo orgánico → ~350 m³ de biogás/día → Bs 21.000/mes.
 * Toda la aritmética del negocio vive acá: la UI nunca multiplica factores.
 */
export class ProduccionBiogas {
  /** Biogás generado, en m³, a partir de kilos de residuo orgánico. */
  static biogasDesdeResiduo(residuoKg: number): number {
    if (residuoKg < 0) throw new Error('El residuo procesado no puede ser negativo');
    return residuoKg * FACTOR_BIOGAS_M3_POR_KG;
  }

  /** Ingreso en bolivianos por un volumen de biogás. */
  static ingresoDesdeBiogas(biogasM3: number): number {
    if (biogasM3 < 0) throw new Error('El volumen de biogás no puede ser negativo');
    return biogasM3 * PRECIO_BS_POR_M3;
  }

  /** Producción del escenario base para una cantidad de días. */
  static baseParaDias(dias: number): number {
    return BIOGAS_BASE_M3_DIA * dias;
  }

  /**
   * Desvío porcentual contra el escenario base.
   * Positivo = por encima de lo proyectado. Con base 0 devuelve 0 en vez de dividir por cero.
   */
  static desvioPorcentual(realM3: number, baseM3: number): number {
    if (baseM3 <= 0) return 0;
    return ((realM3 - baseM3) / baseM3) * 100;
  }

  /** Días calendario cubiertos por un rango, mínimo 1 (un rango de horas cuenta como un día). */
  static diasEntre(desde: Date, hasta: Date): number {
    const MS_DIA = 24 * 60 * 60 * 1000;
    return Math.max(1, Math.ceil((hasta.getTime() - desde.getTime()) / MS_DIA));
  }
}
