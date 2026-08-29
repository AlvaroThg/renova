import { Inject, Injectable, Logger } from '@nestjs/common';
import { META_VARIABLES, TipoVariable } from '@renova/shared';
import {
  BIODIGESTOR_REPOSITORY,
  BiodigestorRepository,
} from '../../domain/ports/repositorios';
import { CLOCK, Clock, MedicionCruda, SensorClient } from '../../domain/ports/servicios';
import { rangoDe } from '../../domain/lectura/rango-operativo';
import { Sensor } from '../../domain/biodigestor/biodigestor.entity';

/**
 * Fuente de mediciones simulada, mientras no haya hardware conectado.
 *
 * Es un adaptador del puerto SensorClient: el día que llegue el ESP32/PLC se
 * escribe un `HardwareSensorAdapter` con la misma interfaz y se cambia una línea
 * en InfrastructureModule. Ni el dominio ni los casos de uso se enteran.
 *
 * El modelo no es ruido blanco: cada variable hace un random walk con reversión
 * a su setpoint (proceso de Ornstein-Uhlenbeck discretizado), que es como se
 * comporta un digestor real bajo control. Cada tanto se fuerza una excursión
 * fuera de rango para que la demo muestre alertas de verdad.
 */
@Injectable()
export class SimuladorSensoresAdapter implements SensorClient {
  private readonly logger = new Logger(SimuladorSensoresAdapter.name);

  /** Último valor de cada variable — el estado del random walk. */
  private readonly valores = new Map<TipoVariable, number>();
  private sensores: Sensor[] = [];

  /** Excursión en curso: empuja una variable fuera de rango durante un rato. */
  private excursion: { variable: TipoVariable; direccion: 1 | -1; hasta: number } | null = null;

  /** Fuerza de reversión al setpoint por muestra. */
  private static readonly REVERSION = 0.08;
  /** Ruido por muestra, como fracción del ancho del rango óptimo. */
  private static readonly RUIDO = 0.12;
  /** Probabilidad por muestra de iniciar una excursión (≈1 cada 2 min a 3 s/muestra). */
  private static readonly PROB_EXCURSION = 0.025;
  private static readonly DURACION_EXCURSION_MS = 45_000;

  constructor(
    @Inject(BIODIGESTOR_REPOSITORY) private readonly biodigestores: BiodigestorRepository,
    @Inject(CLOCK) private readonly reloj: Clock,
  ) {}

  async muestrear(): Promise<MedicionCruda[]> {
    if (this.sensores.length === 0) {
      this.sensores = await this.biodigestores.sensoresActivos();
      if (this.sensores.length === 0) {
        this.logger.warn('No hay sensores registrados: ¿corriste el seed? (pnpm db:seed)');
        return [];
      }
    }

    const ahora = this.reloj.ahora();
    this.actualizarExcursion(ahora);

    return this.sensores.map((sensor) => ({
      sensorId: sensor.id,
      variable: sensor.variable,
      zona: sensor.zona,
      valor: this.siguienteValor(sensor.variable),
      timestamp: ahora,
    }));
  }

  private siguienteValor(variable: TipoVariable): number {
    const rango = rangoDe(variable);
    const anchoOptimo = rango.optimoMax - rango.optimoMin || 1;
    const actual = this.valores.get(variable) ?? rango.setpoint;

    // Durante una excursión el objetivo se corre más allá del límite de alerta,
    // así el valor cruza primero a 'alerta' y después a 'crítico'.
    const objetivo = this.objetivoDe(variable, rango.setpoint, anchoOptimo);

    const deriva = (objetivo - actual) * SimuladorSensoresAdapter.REVERSION;
    const ruido = (Math.random() - 0.5) * anchoOptimo * SimuladorSensoresAdapter.RUIDO;
    const siguiente = actual + deriva + ruido;

    // Límite físico de la variable, no solo estadístico: sin esto el random walk
    // podía reportar H₂S negativo o presión bajo cero, que ningún sensor real
    // entrega y que ensuciaba el historial de alertas con lecturas imposibles.
    const { escala } = META_VARIABLES[variable];
    const margen = anchoOptimo * 2;
    const acotado = Math.min(
      Math.max(siguiente, Math.max(rango.alertaMin - margen, escala.min)),
      Math.min(rango.alertaMax + margen, escala.max),
    );

    this.valores.set(variable, acotado);
    return acotado;
  }

  private objetivoDe(variable: TipoVariable, setpoint: number, anchoOptimo: number): number {
    if (this.excursion?.variable !== variable) return setpoint;
    const rango = rangoDe(variable);
    return this.excursion.direccion === 1
      ? rango.alertaMax + anchoOptimo * 0.4
      : rango.alertaMin - anchoOptimo * 0.4;
  }

  private actualizarExcursion(ahora: Date): void {
    if (this.excursion && ahora.getTime() > this.excursion.hasta) {
      this.logger.log(`Excursión de ${this.excursion.variable} terminada, volviendo a rango`);
      this.excursion = null;
      return;
    }
    if (this.excursion) return;
    if (Math.random() > SimuladorSensoresAdapter.PROB_EXCURSION) return;
    if (this.sensores.length === 0) return;

    const sensor = this.sensores[Math.floor(Math.random() * this.sensores.length)];
    // Variables cuyo óptimo arranca en el piso físico (H₂S, presión) no pueden
    // excursionar hacia abajo: solo se irían a cero y seguirían en rango.
    const puedeBajar =
      rangoDe(sensor.variable).alertaMin > META_VARIABLES[sensor.variable].escala.min;

    this.excursion = {
      variable: sensor.variable,
      direccion: puedeBajar && Math.random() < 0.5 ? -1 : 1,
      hasta: ahora.getTime() + SimuladorSensoresAdapter.DURACION_EXCURSION_MS,
    };
    this.logger.log(`Simulando excursión de ${sensor.variable} fuera de rango`);
  }
}
