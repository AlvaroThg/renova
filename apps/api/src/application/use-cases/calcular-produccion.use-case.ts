import { Inject, Injectable } from '@nestjs/common';
import { ProduccionDto, RangoProduccion } from '@renova/shared';
import { ENTREGA_REPOSITORY, EntregaResiduoRepository } from '../../domain/ports/repositorios';
import { CLOCK, Clock } from '../../domain/ports/servicios';
import { ProduccionBiogas } from '../../domain/produccion/produccion-biogas';
import { EntregaResiduo } from '../../domain/generador/entrega-residuo.entity';

/**
 * Producción de biogás acumulada por día / semana / mes, comparada contra el
 * escenario base de 350 m³/día.
 *
 * La producción se deriva del residuo efectivamente recibido, no se almacena
 * como agregado: una sola fuente de verdad (las entregas) que nunca queda desfasada.
 */
@Injectable()
export class CalcularProduccionUseCase {
  constructor(
    @Inject(ENTREGA_REPOSITORY) private readonly entregas: EntregaResiduoRepository,
    @Inject(CLOCK) private readonly reloj: Clock,
  ) {}

  async ejecutar(rango: RangoProduccion): Promise<ProduccionDto> {
    const hasta = this.reloj.ahora();
    const desde = this.inicioDelRango(hasta, rango);
    const entregas = await this.entregas.entreFechas(desde, hasta);

    const residuoKg = entregas.reduce((total, e) => total + e.cantidadKg, 0);
    const biogasM3 = ProduccionBiogas.biogasDesdeResiduo(residuoKg);
    const ingresoBs = ProduccionBiogas.ingresoDesdeBiogas(biogasM3);
    const dias = ProduccionBiogas.diasEntre(desde, hasta);
    const baseM3 = ProduccionBiogas.baseParaDias(dias);

    return {
      rango,
      desde: desde.toISOString(),
      hasta: hasta.toISOString(),
      biogasM3: redondear(biogasM3),
      residuoKg: redondear(residuoKg),
      ingresoBs: redondear(ingresoBs),
      baseM3: redondear(baseM3),
      desvioPorcentual: redondear(ProduccionBiogas.desvioPorcentual(biogasM3, baseM3)),
      serie: this.serieDiaria(entregas),
    };
  }

  private inicioDelRango(hasta: Date, rango: RangoProduccion): Date {
    const desde = new Date(hasta);
    desde.setHours(0, 0, 0, 0);
    if (rango === 'semana') desde.setDate(desde.getDate() - 6);
    if (rango === 'mes') desde.setDate(desde.getDate() - 29);
    return desde;
  }

  /** Agrupa por día calendario local para el gráfico de barras. */
  private serieDiaria(entregas: EntregaResiduo[]): ProduccionDto['serie'] {
    const porDia = new Map<string, number>();
    for (const entrega of entregas) {
      const clave = claveDia(entrega.fecha);
      porDia.set(clave, (porDia.get(clave) ?? 0) + entrega.cantidadKg);
    }
    return [...porDia.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, residuoKg]) => ({
        fecha,
        residuoKg: redondear(residuoKg),
        biogasM3: redondear(ProduccionBiogas.biogasDesdeResiduo(residuoKg)),
      }));
  }
}

function claveDia(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function redondear(valor: number): number {
  return Number(valor.toFixed(1));
}
