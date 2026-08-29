import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { EntregaResiduoRepository } from '../../../domain/ports/repositorios';
import { EntregaResiduo } from '../../../domain/generador/entrega-residuo.entity';
import { aEntrega } from './prisma.mappers';

@Injectable()
export class EntregaPrismaRepository implements EntregaResiduoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(entrega: EntregaResiduo): Promise<void> {
    await this.prisma.entregaResiduo.create({
      data: {
        id: entrega.id,
        generadorId: entrega.generadorId,
        cantidadKg: entrega.cantidadKg,
        fecha: entrega.fecha,
        origen: entrega.origen,
        observaciones: entrega.observaciones,
      },
    });
  }

  async listar(limite: number): Promise<Array<EntregaResiduo & { generadorNombre: string }>> {
    const filas = await this.prisma.entregaResiduo.findMany({
      orderBy: { fecha: 'desc' },
      take: limite,
      include: { generador: { select: { nombre: true } } },
    });
    return filas.map((fila) =>
      Object.assign(aEntrega(fila), { generadorNombre: fila.generador.nombre }),
    );
  }

  async entreFechas(desde: Date, hasta: Date): Promise<EntregaResiduo[]> {
    const filas = await this.prisma.entregaResiduo.findMany({
      where: { fecha: { gte: desde, lte: hasta } },
      orderBy: { fecha: 'asc' },
    });
    return filas.map(aEntrega);
  }

  async totalesPorGenerador(): Promise<
    Map<string, { totalKg: number; entregas: number; ultima: Date }>
  > {
    const agregados = await this.prisma.entregaResiduo.groupBy({
      by: ['generadorId'],
      _sum: { cantidadKg: true },
      _count: { _all: true },
      _max: { fecha: true },
    });

    return new Map(
      agregados.map((a) => [
        a.generadorId,
        {
          totalKg: a._sum.cantidadKg ?? 0,
          entregas: a._count._all,
          ultima: a._max.fecha ?? new Date(0),
        },
      ]),
    );
  }
}
