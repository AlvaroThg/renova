import { Inject, Injectable } from '@nestjs/common';
import { EstadoZonaDto, ZONAS, Zona } from '@renova/shared';
import { LECTURA_REPOSITORY, LecturaRepository } from '../../domain/ports/repositorios';
import { Biodigestor } from '../../domain/biodigestor/biodigestor.entity';
import { Lectura } from '../../domain/lectura/lectura.entity';
import { lecturaADto } from '../mappers';

/**
 * Estado actual de cada zona de la planta: la última lectura de cada variable,
 * agrupada por zona y resumida en un solo estado por zona.
 * Es lo que colorea el modelo 3D del dashboard al cargar (después lo mantiene el WebSocket).
 */
@Injectable()
export class ObtenerEstadoActualUseCase {
  constructor(@Inject(LECTURA_REPOSITORY) private readonly lecturas: LecturaRepository) {}

  async ejecutar(): Promise<EstadoZonaDto[]> {
    const ultimas = await this.lecturas.ultimasPorVariable();
    return ObtenerEstadoActualUseCase.agrupar(ultimas);
  }

  static agrupar(lecturas: Lectura[]): EstadoZonaDto[] {
    return ZONAS.map((zona: Zona) => {
      const deZona = lecturas.filter((l) => l.zona === zona);
      return {
        zona,
        estado: Biodigestor.estadoDeZona(deZona),
        variables: deZona.map(lecturaADto),
      };
    });
  }
}
