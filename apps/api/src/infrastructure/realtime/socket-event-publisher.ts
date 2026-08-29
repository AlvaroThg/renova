import { Injectable, Logger } from '@nestjs/common';
import { EstadoZonaDto, WS_EVENTS } from '@renova/shared';
import { EventPublisher } from '../../domain/ports/servicios';

/**
 * Lo mínimo que necesita este adaptador para emitir. Tipar estructuralmente en
 * vez de importar Server/Namespace de socket.io evita pelearse con la unión de
 * ambos tipos según cómo Nest resuelva el gateway.
 */
export interface EmisorRealtime {
  emit(evento: string, payload: unknown): unknown;
}
import { Lectura } from '../../domain/lectura/lectura.entity';
import { Alerta } from '../../domain/alerta/alerta.entity';
import { alertaADto, lecturaADto } from '../../application/mappers';

/**
 * Adaptador del puerto EventPublisher sobre Socket.io.
 *
 * El gateway (interface/ws) le entrega el servidor al inicializarse; antes de eso
 * los eventos se descartan en silencio, que es lo correcto: si nadie está
 * escuchando todavía, la lectura igual quedó persistida.
 */
@Injectable()
export class SocketEventPublisher implements EventPublisher {
  private readonly logger = new Logger(SocketEventPublisher.name);
  private servidor: EmisorRealtime | null = null;

  registrarServidor(servidor: EmisorRealtime): void {
    this.servidor = servidor;
    this.logger.log('Gateway de telemetría conectado al publicador de eventos');
  }

  publicarLectura(lectura: Lectura): void {
    this.servidor?.emit(WS_EVENTS.lecturaNueva, lecturaADto(lectura));
  }

  publicarAlerta(alerta: Alerta): void {
    this.servidor?.emit(WS_EVENTS.alertaNueva, alertaADto(alerta));
  }

  publicarEstadoZonas(zonas: EstadoZonaDto[]): void {
    this.servidor?.emit(WS_EVENTS.estadoZonas, zonas);
  }
}
