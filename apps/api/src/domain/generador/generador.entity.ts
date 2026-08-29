export interface PropsGenerador {
  id: string;
  nombre: string;
  tipo: string;
  direccion?: string | null;
  contacto?: string | null;
  activo?: boolean;
  creadoEn?: Date;
}

/**
 * Punto de origen del residuo orgánico: Mercado Campesino, restaurantes,
 * ferias, etc. Es la contraparte social del proyecto — de acá sale la materia prima.
 */
export class Generador {
  readonly id: string;
  readonly nombre: string;
  readonly tipo: string;
  readonly direccion: string | null;
  readonly contacto: string | null;
  readonly activo: boolean;
  readonly creadoEn: Date;

  constructor(props: PropsGenerador) {
    const nombre = props.nombre?.trim();
    if (!nombre) throw new Error('El generador necesita un nombre');
    if (!props.tipo?.trim()) throw new Error('El generador necesita un tipo');

    this.id = props.id;
    this.nombre = nombre;
    this.tipo = props.tipo.trim();
    this.direccion = props.direccion?.trim() || null;
    this.contacto = props.contacto?.trim() || null;
    this.activo = props.activo ?? true;
    this.creadoEn = props.creadoEn ?? new Date();
  }

  con(cambios: Partial<Omit<PropsGenerador, 'id'>>): Generador {
    return new Generador({
      id: this.id,
      nombre: cambios.nombre ?? this.nombre,
      tipo: cambios.tipo ?? this.tipo,
      direccion: cambios.direccion !== undefined ? cambios.direccion : this.direccion,
      contacto: cambios.contacto !== undefined ? cambios.contacto : this.contacto,
      activo: cambios.activo ?? this.activo,
      creadoEn: this.creadoEn,
    });
  }
}
