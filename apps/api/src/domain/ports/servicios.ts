import { EstadoZonaDto, TipoVariable, Zona } from '@renova/shared';
import { Lectura } from '../lectura/lectura.entity';
import { Alerta } from '../alerta/alerta.entity';

/**
 * Puertos de servicio. El adaptador concreto de cada uno vive en infrastructure/
 * y puede cambiarse sin tocar dominio ni casos de uso — que es exactamente lo que
 * pasará cuando el simulador se reemplace por los sensores del ESP32/PLC.
 */

/** Medición cruda que entrega la fuente de sensores, antes de volverse entidad. */
export interface MedicionCruda {
  sensorId: string;
  variable: TipoVariable;
  zona: Zona;
  valor: number;
  timestamp: Date;
}

export const SENSOR_CLIENT = Symbol('SensorClient');
export interface SensorClient {
  /** Toma una muestra de todos los sensores activos. */
  muestrear(): Promise<MedicionCruda[]>;
}

export const EVENT_PUBLISHER = Symbol('EventPublisher');
export interface EventPublisher {
  publicarLectura(lectura: Lectura): void;
  publicarAlerta(alerta: Alerta): void;
  publicarEstadoZonas(zonas: EstadoZonaDto[]): void;
}

export const ID_GENERATOR = Symbol('IdGenerator');
export interface IdGenerator {
  nuevo(): string;
}

export const CLOCK = Symbol('Clock');
export interface Clock {
  ahora(): Date;
}

export const PASSWORD_HASHER = Symbol('PasswordHasher');
export interface PasswordHasher {
  hashear(plano: string): Promise<string>;
  verificar(plano: string, hash: string): Promise<boolean>;
}

export const TOKEN_SERVICE = Symbol('TokenService');
export interface TokenService {
  firmar(payload: { sub: string; email: string }): Promise<string>;
  verificar(token: string): Promise<{ sub: string; email: string } | null>;
}
