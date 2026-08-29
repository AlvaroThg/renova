import { EstadoSensor, TipoVariable } from '@renova/shared';

/**
 * Rango operativo de una variable en digestión anaerobia mesofílica.
 *
 * El rango de alerta CONTIENE al óptimo: un valor dentro del óptimo es normal,
 * dentro del de alerta pero fuera del óptimo es alerta, y fuera de ambos es crítico.
 *
 * Este objeto de valor es el corazón del sistema de alertas: cambiar un umbral
 * acá cambia el color del modelo 3D, la severidad de la alerta y el gauge,
 * sin tocar ningún otro archivo.
 */
export class RangoOperativo {
  private constructor(
    readonly variable: TipoVariable,
    readonly optimoMin: number,
    readonly optimoMax: number,
    readonly alertaMin: number,
    readonly alertaMax: number,
  ) {
    if (alertaMin > optimoMin || alertaMax < optimoMax) {
      throw new Error(
        `Rango inválido para ${variable}: el rango de alerta debe contener al óptimo`,
      );
    }
  }

  static crear(
    variable: TipoVariable,
    optimo: readonly [number, number],
    alerta: readonly [number, number],
  ): RangoOperativo {
    return new RangoOperativo(variable, optimo[0], optimo[1], alerta[0], alerta[1]);
  }

  evaluar(valor: number): EstadoSensor {
    if (valor >= this.optimoMin && valor <= this.optimoMax) return 'normal';
    if (valor >= this.alertaMin && valor <= this.alertaMax) return 'alerta';
    return 'critico';
  }

  /** Punto medio del óptimo — el setpoint alrededor del cual oscila el simulador. */
  get setpoint(): number {
    return (this.optimoMin + this.optimoMax) / 2;
  }

  /** Describe por qué un valor se salió de rango, para el mensaje de la alerta. */
  describirDesvio(valor: number): string {
    if (valor > this.optimoMax) return `por encima del óptimo (máx ${this.optimoMax})`;
    if (valor < this.optimoMin) return `por debajo del óptimo (mín ${this.optimoMin})`;
    return 'dentro del óptimo';
  }
}

/**
 * Tabla de rangos del piloto RENOVA.
 * Valores de referencia para digestión mesofílica de residuo orgánico de mercado.
 */
export const RANGOS_OPERATIVOS: Record<TipoVariable, RangoOperativo> = {
  temperatura: RangoOperativo.crear('temperatura', [33, 37], [30, 40]),
  ph: RangoOperativo.crear('ph', [6.8, 7.2], [6.5, 7.5]),
  presion: RangoOperativo.crear('presion', [0.02, 0.05], [0.01, 0.07]),
  humedad: RangoOperativo.crear('humedad', [60, 70], [55, 75]),
  ch4: RangoOperativo.crear('ch4', [55, 70], [50, 80]),
  co2: RangoOperativo.crear('co2', [25, 40], [20, 45]),
  h2s: RangoOperativo.crear('h2s', [0, 200], [0, 500]),
};

export function rangoDe(variable: TipoVariable): RangoOperativo {
  return RANGOS_OPERATIVOS[variable];
}
