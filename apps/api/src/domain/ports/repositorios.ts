import { TipoVariable, Zona } from '@renova/shared';
import { Lectura } from '../lectura/lectura.entity';
import { Alerta } from '../alerta/alerta.entity';
import { Generador } from '../generador/generador.entity';
import { EntregaResiduo } from '../generador/entrega-residuo.entity';
import { Biodigestor, Sensor } from '../biodigestor/biodigestor.entity';

/**
 * Puertos de persistencia. El dominio declara lo que necesita; la infraestructura
 * decide con qué (hoy Prisma/Postgres). Los tokens Symbol son lo que Nest inyecta.
 */

export const LECTURA_REPOSITORY = Symbol('LecturaRepository');
export interface LecturaRepository {
  guardar(lectura: Lectura): Promise<void>;
  /** Última lectura de cada variable — el estado actual de la planta. */
  ultimasPorVariable(): Promise<Lectura[]>;
  historico(variable: TipoVariable, desde: Date, hasta: Date): Promise<Lectura[]>;
}

export const ALERTA_REPOSITORY = Symbol('AlertaRepository');
export interface AlertaRepository {
  guardar(alerta: Alerta): Promise<void>;
  listar(limite: number): Promise<Alerta[]>;
  contarSinReconocer(): Promise<number>;
  reconocer(id: string): Promise<void>;
  /** Última alerta registrada de una variable — para no repetir la misma cada 3 segundos. */
  ultimaDeVariable(variable: TipoVariable): Promise<Alerta | null>;
}

export const GENERADOR_REPOSITORY = Symbol('GeneradorRepository');
export interface GeneradorRepository {
  listar(): Promise<Generador[]>;
  buscarPorId(id: string): Promise<Generador | null>;
  guardar(generador: Generador): Promise<void>;
  eliminar(id: string): Promise<void>;
}

export const ENTREGA_REPOSITORY = Symbol('EntregaResiduoRepository');
export interface EntregaResiduoRepository {
  guardar(entrega: EntregaResiduo): Promise<void>;
  listar(limite: number): Promise<Array<EntregaResiduo & { generadorNombre: string }>>;
  /** Entregas dentro de un rango — base del cálculo de producción. */
  entreFechas(desde: Date, hasta: Date): Promise<EntregaResiduo[]>;
  /** Total histórico entregado por generador, en kg. */
  totalesPorGenerador(): Promise<Map<string, { totalKg: number; entregas: number; ultima: Date }>>;
}

export const BIODIGESTOR_REPOSITORY = Symbol('BiodigestorRepository');
export interface BiodigestorRepository {
  principal(): Promise<Biodigestor | null>;
  sensoresActivos(): Promise<Sensor[]>;
  sensorDe(variable: TipoVariable, zona: Zona): Promise<Sensor | null>;
}

export const USUARIO_REPOSITORY = Symbol('UsuarioRepository');
export interface UsuarioAutenticable {
  id: string;
  email: string;
  nombre: string;
  passwordHash: string;
}
export interface UsuarioRepository {
  buscarPorEmail(email: string): Promise<UsuarioAutenticable | null>;
}
