import {
  Alerta as AlertaRow,
  EntregaResiduo as EntregaRow,
  Generador as GeneradorRow,
  Lectura as LecturaRow,
  Sensor as SensorRow,
} from '@prisma/client';
import { Severidad, TipoVariable, Zona } from '@renova/shared';
import { Lectura } from '../../../domain/lectura/lectura.entity';
import { Alerta } from '../../../domain/alerta/alerta.entity';
import { Generador } from '../../../domain/generador/generador.entity';
import {
  EntregaResiduo,
  OrigenEntrega,
} from '../../../domain/generador/entrega-residuo.entity';
import { Sensor } from '../../../domain/biodigestor/biodigestor.entity';

/**
 * Traducción fila de Postgres → entidad de dominio.
 * Las columnas de enum se guardan como texto (Prisma enums acoplarían el
 * esquema al dominio); acá se estrechan de vuelta al tipo correcto.
 */

export function aLectura(row: LecturaRow): Lectura {
  // El estado no se lee de la columna: lo recalcula el dominio, que es la
  // autoridad. Así, un cambio de umbral se refleja al releer el histórico.
  return new Lectura({
    id: row.id,
    sensorId: row.sensorId,
    variable: row.variable as TipoVariable,
    zona: row.zona as Zona,
    valor: row.valor,
    timestamp: row.timestamp,
  });
}

export function aAlerta(row: AlertaRow): Alerta {
  return new Alerta({
    id: row.id,
    variable: row.variable as TipoVariable,
    zona: row.zona as Zona,
    valor: row.valor,
    severidad: row.severidad as Severidad,
    mensaje: row.mensaje,
    timestamp: row.timestamp,
    reconocida: row.reconocida,
  });
}

export function aGenerador(row: GeneradorRow): Generador {
  return new Generador({
    id: row.id,
    nombre: row.nombre,
    tipo: row.tipo,
    direccion: row.direccion,
    contacto: row.contacto,
    activo: row.activo,
    creadoEn: row.creadoEn,
  });
}

export function aEntrega(row: EntregaRow): EntregaResiduo {
  return new EntregaResiduo({
    id: row.id,
    generadorId: row.generadorId,
    cantidadKg: row.cantidadKg,
    fecha: row.fecha,
    origen: row.origen as OrigenEntrega,
    observaciones: row.observaciones,
  });
}

export function aSensor(row: SensorRow): Sensor {
  return new Sensor({
    id: row.id,
    variable: row.variable as TipoVariable,
    zona: row.zona as Zona,
    etiqueta: row.etiqueta,
    activo: row.activo,
  });
}
