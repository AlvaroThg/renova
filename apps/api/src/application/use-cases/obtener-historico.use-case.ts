import { Inject, Injectable } from '@nestjs/common';
import { HistoricoDto, META_VARIABLES, TipoVariable } from '@renova/shared';
import { LECTURA_REPOSITORY, LecturaRepository } from '../../domain/ports/repositorios';
import { CLOCK, Clock } from '../../domain/ports/servicios';

/** Serie temporal de una variable para el gráfico de línea del dashboard. */
@Injectable()
export class ObtenerHistoricoUseCase {
  /** Techo de puntos enviados al cliente: más que esto no se distingue en pantalla. */
  private static readonly MAX_PUNTOS = 180;

  constructor(
    @Inject(LECTURA_REPOSITORY) private readonly lecturas: LecturaRepository,
    @Inject(CLOCK) private readonly reloj: Clock,
  ) {}

  async ejecutar(variable: TipoVariable, horas = 24): Promise<HistoricoDto> {
    const hasta = this.reloj.ahora();
    const desde = new Date(hasta.getTime() - horas * 60 * 60 * 1000);
    const lecturas = await this.lecturas.historico(variable, desde, hasta);
    const meta = META_VARIABLES[variable];

    /**
     * Agregación por ventanas de tiempo iguales, no por índice.
     *
     * Las fuentes no muestrean al mismo ritmo: el historial sembrado va cada
     * 10 minutos y el simulador en vivo cada 3 segundos. Submuestrear por índice
     * haría que los últimos minutos ocuparan la mitad de la serie y el resto del
     * día quedara aplastado. Promediando por ventana, cada punto cubre siempre
     * el mismo lapso, venga de donde venga el dato.
     */
    const inicio = desde.getTime();
    const anchoVentana = Math.max(
      1,
      (hasta.getTime() - inicio) / ObtenerHistoricoUseCase.MAX_PUNTOS,
    );

    const ventanas = new Map<number, { suma: number; conteo: number }>();
    for (const lectura of lecturas) {
      const indice = Math.floor((lectura.timestamp.getTime() - inicio) / anchoVentana);
      const ventana = ventanas.get(indice) ?? { suma: 0, conteo: 0 };
      ventana.suma += lectura.valor;
      ventana.conteo += 1;
      ventanas.set(indice, ventana);
    }

    const decimales = meta.decimales;
    const puntos = [...ventanas.entries()]
      .sort(([a], [b]) => a - b)
      .map(([indice, ventana]) => ({
        // Centro de la ventana: representa el lapso mejor que cualquiera de sus bordes.
        timestamp: new Date(inicio + (indice + 0.5) * anchoVentana).toISOString(),
        valor: Number((ventana.suma / ventana.conteo).toFixed(decimales)),
      }));

    return { variable, unidad: meta.unidad, puntos };
  }
}
