import { Inject, Injectable } from '@nestjs/common';
import { Lectura } from '../../domain/lectura/lectura.entity';
import { Alerta } from '../../domain/alerta/alerta.entity';
import {
  ALERTA_REPOSITORY,
  AlertaRepository,
  LECTURA_REPOSITORY,
  LecturaRepository,
} from '../../domain/ports/repositorios';
import {
  EVENT_PUBLISHER,
  EventPublisher,
  ID_GENERATOR,
  IdGenerator,
  MedicionCruda,
} from '../../domain/ports/servicios';

/**
 * Registra una medición venga de donde venga: hoy del simulador, mañana de un
 * ESP32 posteando a /lecturas. Persiste, evalúa el rango, genera la alerta si
 * corresponde y publica ambas cosas en tiempo real.
 */
@Injectable()
export class RegistrarLecturaUseCase {
  /**
   * Ventana anti-ruido: si una variable ya alertó hace menos de esto con la misma
   * severidad, no se vuelve a registrar. Sin esto, muestrear cada 3 s llenaría la
   * tabla de alertas con cientos de filas idénticas durante una sola excursión.
   */
  private static readonly VENTANA_DEDUPE_MS = 5 * 60 * 1000;

  constructor(
    @Inject(LECTURA_REPOSITORY) private readonly lecturas: LecturaRepository,
    @Inject(ALERTA_REPOSITORY) private readonly alertas: AlertaRepository,
    @Inject(EVENT_PUBLISHER) private readonly eventos: EventPublisher,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async ejecutar(medicion: MedicionCruda): Promise<Lectura> {
    const lectura = new Lectura({
      id: this.ids.nuevo(),
      sensorId: medicion.sensorId,
      variable: medicion.variable,
      zona: medicion.zona,
      valor: medicion.valor,
      timestamp: medicion.timestamp,
    });

    await this.lecturas.guardar(lectura);
    this.eventos.publicarLectura(lectura);

    const alerta = Alerta.desdeLectura(lectura, this.ids.nuevo());
    if (alerta && (await this.debeRegistrarse(alerta))) {
      await this.alertas.guardar(alerta);
      this.eventos.publicarAlerta(alerta);
    }

    return lectura;
  }

  private async debeRegistrarse(alerta: Alerta): Promise<boolean> {
    const ultima = await this.alertas.ultimaDeVariable(alerta.variable);
    if (!ultima) return true;
    // Un salto de alerta a crítico siempre se registra, aunque sea dentro de la ventana.
    if (ultima.severidad !== alerta.severidad) return true;
    const transcurrido = alerta.timestamp.getTime() - ultima.timestamp.getTime();
    return transcurrido >= RegistrarLecturaUseCase.VENTANA_DEDUPE_MS;
  }
}
