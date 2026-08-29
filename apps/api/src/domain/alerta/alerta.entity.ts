import { META_VARIABLES, Severidad, TipoVariable, Zona } from '@renova/shared';
import { Lectura } from '../lectura/lectura.entity';
import { rangoDe } from '../lectura/rango-operativo';

export interface PropsAlerta {
  id: string;
  variable: TipoVariable;
  zona: Zona;
  valor: number;
  severidad: Severidad;
  mensaje: string;
  timestamp: Date;
  reconocida?: boolean;
}

/**
 * Alerta generada cuando una lectura sale del rango operativo.
 * Se construye siempre desde una Lectura, para que severidad y mensaje
 * no puedan desincronizarse del estado que la originó.
 */
export class Alerta {
  readonly id: string;
  readonly variable: TipoVariable;
  readonly zona: Zona;
  readonly valor: number;
  readonly severidad: Severidad;
  readonly mensaje: string;
  readonly timestamp: Date;
  readonly reconocida: boolean;

  constructor(props: PropsAlerta) {
    this.id = props.id;
    this.variable = props.variable;
    this.zona = props.zona;
    this.valor = props.valor;
    this.severidad = props.severidad;
    this.mensaje = props.mensaje;
    this.timestamp = props.timestamp;
    this.reconocida = props.reconocida ?? false;
  }

  /** Devuelve null si la lectura está en rango: no toda lectura genera alerta. */
  static desdeLectura(lectura: Lectura, id: string): Alerta | null {
    if (!lectura.fueraDeRango) return null;

    const meta = META_VARIABLES[lectura.variable];
    const desvio = rangoDe(lectura.variable).describirDesvio(lectura.valor);
    const severidad: Severidad = lectura.estado === 'critico' ? 'critico' : 'alerta';
    const prefijo = severidad === 'critico' ? 'CRÍTICO' : 'Alerta';

    return new Alerta({
      id,
      variable: lectura.variable,
      zona: lectura.zona,
      valor: lectura.valor,
      severidad,
      // toFixed y no valorPresentable: "0.050 bar" es más claro que "0.05 bar"
      // cuando el umbral que se cruzó también es 0.05.
      mensaje: `${prefijo}: ${meta.etiqueta} en ${lectura.valor.toFixed(meta.decimales)}${meta.unidad ? ' ' + meta.unidad : ''} — ${desvio}`,
      timestamp: lectura.timestamp,
    });
  }

  get unidad(): string {
    return META_VARIABLES[this.variable].unidad;
  }
}
