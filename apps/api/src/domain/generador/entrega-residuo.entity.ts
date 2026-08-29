/** Cómo se registró el peso: hoy siempre manual; 'bascula' cuando se integre el hardware. */
export type OrigenEntrega = 'manual' | 'bascula';

export interface PropsEntregaResiduo {
  id: string;
  generadorId: string;
  cantidadKg: number;
  fecha: Date;
  origen?: OrigenEntrega;
  observaciones?: string | null;
}

/** Una entrega de residuo orgánico de un generador a la planta. */
export class EntregaResiduo {
  readonly id: string;
  readonly generadorId: string;
  readonly cantidadKg: number;
  readonly fecha: Date;
  readonly origen: OrigenEntrega;
  readonly observaciones: string | null;

  /** Tope de cordura: una entrega de más de 10 t es un error de tipeo, no un camión. */
  static readonly MAX_KG_POR_ENTREGA = 10_000;

  constructor(props: PropsEntregaResiduo) {
    if (!props.generadorId) throw new Error('La entrega debe indicar el generador de origen');
    if (!Number.isFinite(props.cantidadKg) || props.cantidadKg <= 0) {
      throw new Error('La cantidad entregada debe ser mayor a 0 kg');
    }
    if (props.cantidadKg > EntregaResiduo.MAX_KG_POR_ENTREGA) {
      throw new Error(
        `La cantidad entregada supera el máximo de ${EntregaResiduo.MAX_KG_POR_ENTREGA} kg por entrega`,
      );
    }

    this.id = props.id;
    this.generadorId = props.generadorId;
    this.cantidadKg = props.cantidadKg;
    this.fecha = props.fecha;
    this.origen = props.origen ?? 'manual';
    this.observaciones = props.observaciones?.trim() || null;
  }
}
