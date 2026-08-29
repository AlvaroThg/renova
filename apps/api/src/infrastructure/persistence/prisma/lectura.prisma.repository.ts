import { Injectable } from '@nestjs/common';
import { TIPOS_VARIABLE, TipoVariable } from '@renova/shared';
import { PrismaService } from './prisma.service';
import { LecturaRepository } from '../../../domain/ports/repositorios';
import { Lectura } from '../../../domain/lectura/lectura.entity';
import { aLectura } from './prisma.mappers';

@Injectable()
export class LecturaPrismaRepository implements LecturaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(lectura: Lectura): Promise<void> {
    await this.prisma.lectura.create({
      data: {
        id: lectura.id,
        sensorId: lectura.sensorId,
        variable: lectura.variable,
        zona: lectura.zona,
        valor: lectura.valor,
        estado: lectura.estado,
        timestamp: lectura.timestamp,
      },
    });
  }

  /**
   * Última lectura de cada variable. Se resuelve con una consulta por variable
   * en paralelo (7 en total) en vez de un DISTINCT ON: son 7 índices puntuales
   * y evita SQL crudo, manteniendo el repositorio portable.
   */
  async ultimasPorVariable(): Promise<Lectura[]> {
    const filas = await Promise.all(
      TIPOS_VARIABLE.map((variable) =>
        this.prisma.lectura.findFirst({
          where: { variable },
          orderBy: { timestamp: 'desc' },
        }),
      ),
    );
    return filas.filter((f) => f !== null).map(aLectura);
  }

  async historico(variable: TipoVariable, desde: Date, hasta: Date): Promise<Lectura[]> {
    const filas = await this.prisma.lectura.findMany({
      where: { variable, timestamp: { gte: desde, lte: hasta } },
      orderBy: { timestamp: 'asc' },
    });
    return filas.map(aLectura);
  }
}
