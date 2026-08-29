import type { TipoVariable, Zona } from './variables';
import type { EstadoSensor, Severidad } from './estados';

/** Una medición puntual de una variable, tal como viaja por REST y WebSocket. */
export interface LecturaDto {
  id: string;
  sensorId: string;
  variable: TipoVariable;
  zona: Zona;
  valor: number;
  unidad: string;
  estado: EstadoSensor;
  timestamp: string; // ISO 8601
}

/** Estado actual de cada variable — lo que pinta los gauges al abrir el dashboard. */
export interface EstadoZonaDto {
  zona: Zona;
  estado: EstadoSensor;
  variables: LecturaDto[];
}

export interface AlertaDto {
  id: string;
  variable: TipoVariable;
  zona: Zona;
  valor: number;
  unidad: string;
  severidad: Severidad;
  mensaje: string;
  timestamp: string;
  reconocida: boolean;
}

export interface PuntoHistoricoDto {
  timestamp: string;
  valor: number;
}

export interface HistoricoDto {
  variable: TipoVariable;
  unidad: string;
  puntos: PuntoHistoricoDto[];
}

export type RangoProduccion = 'dia' | 'semana' | 'mes';

export interface ProduccionDto {
  rango: RangoProduccion;
  desde: string;
  hasta: string;
  /** Biogás producido en el rango, en m³. */
  biogasM3: number;
  /** Residuo procesado en el rango, en kg. */
  residuoKg: number;
  /** Ingreso estimado en bolivianos. */
  ingresoBs: number;
  /** Producción del escenario base para el mismo rango (350 m³/día). */
  baseM3: number;
  /** Desvío porcentual contra el escenario base. Positivo = por encima. */
  desvioPorcentual: number;
  /** Serie diaria para el gráfico de barras. */
  serie: Array<{ fecha: string; biogasM3: number; residuoKg: number }>;
}

export interface GeneradorDto {
  id: string;
  nombre: string;
  tipo: string;
  direccion: string | null;
  contacto: string | null;
  activo: boolean;
  /** Total histórico entregado en kg. */
  totalEntregadoKg: number;
  /** Cantidad de entregas registradas. */
  entregas: number;
  ultimaEntrega: string | null;
}

export interface CrearGeneradorDto {
  nombre: string;
  tipo: string;
  direccion?: string | null;
  contacto?: string | null;
  activo?: boolean;
}

export type ActualizarGeneradorDto = Partial<CrearGeneradorDto>;

export interface EntregaResiduoDto {
  id: string;
  generadorId: string;
  generadorNombre: string;
  cantidadKg: number;
  fecha: string;
  /** 'manual' hoy; 'bascula' cuando se integre el hardware de pesaje. */
  origen: string;
  observaciones: string | null;
}

export interface RegistrarEntregaDto {
  generadorId: string;
  cantidadKg: number;
  fecha?: string;
  observaciones?: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  usuario: {
    id: string;
    email: string;
    nombre: string;
  };
}

/** Tarjetas de resumen de la vista general del dashboard. */
export interface ResumenDto {
  biogasHoyM3: number;
  residuoHoyKg: number;
  ingresoMesBs: number;
  alertasActivas: number;
  estadoPlanta: EstadoSensor;
  zonas: EstadoZonaDto[];
}
