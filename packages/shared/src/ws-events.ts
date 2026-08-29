import type { AlertaDto, EstadoZonaDto, LecturaDto } from './dto';

/** Namespace del gateway de telemetría en el backend NestJS. */
export const WS_NAMESPACE = '/telemetria';

/** Nombres de evento — compartidos para que gateway y cliente no se desincronicen. */
export const WS_EVENTS = {
  lecturaNueva: 'lectura:nueva',
  alertaNueva: 'alerta:nueva',
  estadoZonas: 'estado:zonas',
} as const;

/** Payload de cada evento emitido por el servidor. */
export interface ServerToClientEvents {
  'lectura:nueva': (lectura: LecturaDto) => void;
  'alerta:nueva': (alerta: AlertaDto) => void;
  'estado:zonas': (zonas: EstadoZonaDto[]) => void;
}

/** Hoy el cliente solo escucha; se deja el tipo para futuros comandos al PLC. */
export interface ClientToServerEvents {
  [evento: string]: never;
}
