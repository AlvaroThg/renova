import { EstadoSensor, META_VARIABLES, TipoVariable, Zona } from '@renova/shared';
import { rangoDe } from './rango-operativo';

export interface PropsLectura {
  id: string;
  sensorId: string;
  variable: TipoVariable;
  zona: Zona;
  valor: number;
  timestamp: Date;
}

/**
 * Una medición puntual de una variable de proceso.
 *
 * La entidad calcula su propio estado a partir del rango operativo: nadie
 * fuera del dominio decide si una lectura es normal, de alerta o crítica.
 */
export class Lectura {
  readonly id: string;
  readonly sensorId: string;
  readonly variable: TipoVariable;
  readonly zona: Zona;
  readonly valor: number;
  readonly timestamp: Date;
  readonly estado: EstadoSensor;

  constructor(props: PropsLectura) {
    if (!Number.isFinite(props.valor)) {
      throw new Error(`Valor de lectura inválido para ${props.variable}: ${props.valor}`);
    }
    this.id = props.id;
    this.sensorId = props.sensorId;
    this.variable = props.variable;
    this.zona = props.zona;
    this.valor = props.valor;
    this.timestamp = props.timestamp;
    this.estado = rangoDe(props.variable).evaluar(props.valor);
  }

  get unidad(): string {
    return META_VARIABLES[this.variable].unidad;
  }

  get fueraDeRango(): boolean {
    return this.estado !== 'normal';
  }

  /** Valor redondeado a los decimales que corresponden a la variable. */
  get valorPresentable(): number {
    const decimales = META_VARIABLES[this.variable].decimales;
    return Number(this.valor.toFixed(decimales));
  }
}
