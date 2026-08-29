import { Injectable } from '@nestjs/common';
import { ResumenDto, peorEstado } from '@renova/shared';
import { ObtenerEstadoActualUseCase } from './obtener-estado-actual.use-case';
import { CalcularProduccionUseCase } from './calcular-produccion.use-case';
import { GestionarAlertasUseCase } from './gestionar-alertas.use-case';

/**
 * Tarjetas de la vista general del dashboard.
 * Compone otros casos de uso en vez de volver a consultar repositorios:
 * la regla de cada número vive en un solo lugar.
 */
@Injectable()
export class ObtenerResumenUseCase {
  constructor(
    private readonly estadoActual: ObtenerEstadoActualUseCase,
    private readonly produccion: CalcularProduccionUseCase,
    private readonly alertas: GestionarAlertasUseCase,
  ) {}

  async ejecutar(): Promise<ResumenDto> {
    const [zonas, hoy, mes, alertasActivas] = await Promise.all([
      this.estadoActual.ejecutar(),
      this.produccion.ejecutar('dia'),
      this.produccion.ejecutar('mes'),
      this.alertas.contarSinReconocer(),
    ]);

    return {
      biogasHoyM3: hoy.biogasM3,
      residuoHoyKg: hoy.residuoKg,
      ingresoMesBs: mes.ingresoBs,
      alertasActivas,
      estadoPlanta: peorEstado(zonas.map((z) => z.estado)),
      zonas,
    };
  }
}
