import {
  AlertaDto,
  EntregaResiduoDto,
  GeneradorDto,
  LecturaDto,
  META_VARIABLES,
} from '@renova/shared';
import { Lectura } from '../domain/lectura/lectura.entity';
import { Alerta } from '../domain/alerta/alerta.entity';
import { Generador } from '../domain/generador/generador.entity';
import { EntregaResiduo } from '../domain/generador/entrega-residuo.entity';

/** Traducción entidad de dominio → contrato compartido con el frontend. */

export function lecturaADto(lectura: Lectura): LecturaDto {
  return {
    id: lectura.id,
    sensorId: lectura.sensorId,
    variable: lectura.variable,
    zona: lectura.zona,
    valor: lectura.valorPresentable,
    unidad: lectura.unidad,
    estado: lectura.estado,
    timestamp: lectura.timestamp.toISOString(),
  };
}

export function alertaADto(alerta: Alerta): AlertaDto {
  const meta = META_VARIABLES[alerta.variable];
  return {
    id: alerta.id,
    variable: alerta.variable,
    zona: alerta.zona,
    valor: Number(alerta.valor.toFixed(meta.decimales)),
    unidad: alerta.unidad,
    severidad: alerta.severidad,
    mensaje: alerta.mensaje,
    timestamp: alerta.timestamp.toISOString(),
    reconocida: alerta.reconocida,
  };
}

export function generadorADto(
  generador: Generador,
  totales?: { totalKg: number; entregas: number; ultima: Date },
): GeneradorDto {
  return {
    id: generador.id,
    nombre: generador.nombre,
    tipo: generador.tipo,
    direccion: generador.direccion,
    contacto: generador.contacto,
    activo: generador.activo,
    totalEntregadoKg: Number((totales?.totalKg ?? 0).toFixed(1)),
    entregas: totales?.entregas ?? 0,
    ultimaEntrega: totales?.ultima ? totales.ultima.toISOString() : null,
  };
}

export function entregaADto(
  entrega: EntregaResiduo & { generadorNombre: string },
): EntregaResiduoDto {
  return {
    id: entrega.id,
    generadorId: entrega.generadorId,
    generadorNombre: entrega.generadorNombre,
    cantidadKg: entrega.cantidadKg,
    fecha: entrega.fecha.toISOString(),
    origen: entrega.origen,
    observaciones: entrega.observaciones,
  };
}
