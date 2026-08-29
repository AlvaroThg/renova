import { EstadoSensor, TipoVariable, Zona, peorEstado } from '@renova/shared';
import { Lectura } from '../lectura/lectura.entity';

export interface PropsSensor {
  id: string;
  variable: TipoVariable;
  zona: Zona;
  etiqueta: string;
  activo?: boolean;
}

/** Un punto de medición físico instalado en una zona de la planta. */
export class Sensor {
  readonly id: string;
  readonly variable: TipoVariable;
  readonly zona: Zona;
  readonly etiqueta: string;
  readonly activo: boolean;

  constructor(props: PropsSensor) {
    this.id = props.id;
    this.variable = props.variable;
    this.zona = props.zona;
    this.etiqueta = props.etiqueta;
    this.activo = props.activo ?? true;
  }
}

export interface PropsBiodigestor {
  id: string;
  nombre: string;
  capacidadM3: number;
  ubicacion?: string | null;
  sensores?: Sensor[];
}

/**
 * Agregado raíz del piloto: el biodigestor con sus sensores.
 * Sabe resumir el estado de una zona a partir de las lecturas actuales,
 * que es lo que colorea el modelo 3D del dashboard.
 */
export class Biodigestor {
  readonly id: string;
  readonly nombre: string;
  readonly capacidadM3: number;
  readonly ubicacion: string | null;
  readonly sensores: Sensor[];

  constructor(props: PropsBiodigestor) {
    if (props.capacidadM3 <= 0) throw new Error('La capacidad del biodigestor debe ser positiva');
    this.id = props.id;
    this.nombre = props.nombre;
    this.capacidadM3 = props.capacidadM3;
    this.ubicacion = props.ubicacion ?? null;
    this.sensores = props.sensores ?? [];
  }

  sensoresDeZona(zona: Zona): Sensor[] {
    return this.sensores.filter((s) => s.zona === zona && s.activo);
  }

  /** El estado de una zona es el peor de sus variables: una sola crítica pinta la zona en rojo. */
  static estadoDeZona(lecturas: readonly Lectura[]): EstadoSensor {
    if (lecturas.length === 0) return 'normal';
    return peorEstado(lecturas.map((l) => l.estado));
  }
}
