import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RegistrarLecturaUseCase } from '../../application/use-cases/registrar-lectura.use-case';
import { ObtenerEstadoActualUseCase } from '../../application/use-cases/obtener-estado-actual.use-case';
import { SENSOR_CLIENT, SensorClient } from '../../domain/ports/servicios';
import { EVENT_PUBLISHER, EventPublisher } from '../../domain/ports/servicios';

/**
 * Dispara el muestreo periódico de sensores.
 *
 * Vive en infraestructura a propósito: el caso de uso RegistrarLectura no sabe
 * que existe un temporizador ni un simulador. Cuando el hardware real haga push
 * (MQTT o HTTP), este scheduler simplemente se apaga con SIMULADOR_ACTIVO=false.
 */
@Injectable()
export class SimuladorScheduler implements OnModuleInit {
  private readonly logger = new Logger(SimuladorScheduler.name);
  private muestreando = false;

  constructor(
    @Inject(SENSOR_CLIENT) private readonly sensores: SensorClient,
    @Inject(EVENT_PUBLISHER) private readonly eventos: EventPublisher,
    private readonly registrarLectura: RegistrarLecturaUseCase,
    private readonly estadoActual: ObtenerEstadoActualUseCase,
    private readonly config: ConfigService,
    private readonly scheduler: SchedulerRegistry,
  ) {}

  onModuleInit(): void {
    const activo = this.config.get<string>('SIMULADOR_ACTIVO', 'true') !== 'false';
    if (!activo) {
      this.logger.log('Simulador desactivado (SIMULADOR_ACTIVO=false)');
      return;
    }

    const intervalo = Number(this.config.get<string>('SIMULADOR_INTERVALO_MS', '3000'));
    const timer = setInterval(() => void this.tick(), intervalo);
    this.scheduler.addInterval('muestreo-sensores', timer);
    this.logger.log(`Simulador de sensores activo cada ${intervalo} ms`);
  }

  private async tick(): Promise<void> {
    // Si la base va lenta, saltar el tick en vez de encolar muestreos superpuestos.
    if (this.muestreando) return;
    this.muestreando = true;
    try {
      const mediciones = await this.sensores.muestrear();
      const lecturas = await Promise.all(
        mediciones.map((m) => this.registrarLectura.ejecutar(m)),
      );
      if (lecturas.length > 0) {
        this.eventos.publicarEstadoZonas(ObtenerEstadoActualUseCase.agrupar(lecturas));
      }
    } catch (error) {
      this.logger.error(`Fallo el muestreo de sensores: ${(error as Error).message}`);
    } finally {
      this.muestreando = false;
    }
  }
}
