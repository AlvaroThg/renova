import { Injectable } from '@nestjs/common';
import { TipoVariable, Zona } from '@renova/shared';
import { PrismaService } from './prisma.service';
import { BiodigestorRepository } from '../../../domain/ports/repositorios';
import { Biodigestor, Sensor } from '../../../domain/biodigestor/biodigestor.entity';
import { aSensor } from './prisma.mappers';

@Injectable()
export class BiodigestorPrismaRepository implements BiodigestorRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** El piloto tiene un solo biodigestor; se toma el primero creado. */
  async principal(): Promise<Biodigestor | null> {
    const fila = await this.prisma.biodigestor.findFirst({
      orderBy: { creadoEn: 'asc' },
      include: { sensores: true },
    });
    if (!fila) return null;

    return new Biodigestor({
      id: fila.id,
      nombre: fila.nombre,
      capacidadM3: fila.capacidadM3,
      ubicacion: fila.ubicacion,
      sensores: fila.sensores.map(aSensor),
    });
  }

  async sensoresActivos(): Promise<Sensor[]> {
    const filas = await this.prisma.sensor.findMany({ where: { activo: true } });
    return filas.map(aSensor);
  }

  async sensorDe(variable: TipoVariable, zona: Zona): Promise<Sensor | null> {
    const fila = await this.prisma.sensor.findFirst({ where: { variable, zona, activo: true } });
    return fila ? aSensor(fila) : null;
  }
}
