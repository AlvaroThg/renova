import { Inject, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WS_EVENTS, WS_NAMESPACE } from '@renova/shared';
import type { Socket } from 'socket.io';
import {
  SocketEventPublisher,
  EmisorRealtime,
} from '../../infrastructure/realtime/socket-event-publisher';
import { TOKEN_SERVICE, TokenService } from '../../domain/ports/servicios';
import { ObtenerEstadoActualUseCase } from '../../application/use-cases/obtener-estado-actual.use-case';

/**
 * Punto de entrada WebSocket del dashboard.
 *
 * No contiene lógica: autentica el handshake, manda el estado inicial y le
 * entrega el emisor al publicador de eventos. Todo lo que se emite después lo
 * decide el caso de uso RegistrarLectura.
 */
@WebSocketGateway({
  namespace: WS_NAMESPACE,
  cors: { origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000', credentials: true },
})
export class TelemetriaGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(TelemetriaGateway.name);

  @WebSocketServer()
  private readonly servidor: EmisorRealtime;

  constructor(
    private readonly publisher: SocketEventPublisher,
    private readonly estadoActual: ObtenerEstadoActualUseCase,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  afterInit(servidor: EmisorRealtime): void {
    this.publisher.registrarServidor(servidor ?? this.servidor);
  }

  async handleConnection(cliente: Socket): Promise<void> {
    const token =
      (cliente.handshake.auth?.token as string | undefined) ??
      cliente.handshake.headers.authorization?.replace('Bearer ', '');

    const payload = token ? await this.tokens.verificar(token) : null;
    if (!payload) {
      this.logger.warn(`Conexión rechazada sin token válido: ${cliente.id}`);
      cliente.emit('error', 'No autorizado');
      cliente.disconnect(true);
      return;
    }

    this.logger.log(`Operador conectado a telemetría: ${payload.email}`);
    // Estado inicial inmediato: el dashboard no espera al primer muestreo.
    cliente.emit(WS_EVENTS.estadoZonas, await this.estadoActual.ejecutar());
  }
}
