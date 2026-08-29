import { Injectable } from '@nestjs/common';
import { TipoVariable } from '@renova/shared';
import { PrismaService } from './prisma.service';
import { AlertaRepository } from '../../../domain/ports/repositorios';
import { Alerta } from '../../../domain/alerta/alerta.entity';
import { aAlerta } from './prisma.mappers';

@Injectable()
export class AlertaPrismaRepository implements AlertaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(alerta: Alerta): Promise<void> {
    await this.prisma.alerta.create({
      data: {
        id: alerta.id,
        variable: alerta.variable,
        zona: alerta.zona,
        valor: alerta.valor,
        severidad: alerta.severidad,
        mensaje: alerta.mensaje,
        timestamp: alerta.timestamp,
        reconocida: alerta.reconocida,
      },
    });
  }

  async listar(limite: number): Promise<Alerta[]> {
    const filas = await this.prisma.alerta.findMany({
      orderBy: { timestamp: 'desc' },
      take: limite,
    });
    return filas.map(aAlerta);
  }

  async contarSinReconocer(): Promise<number> {
    return this.prisma.alerta.count({ where: { reconocida: false } });
  }

  async reconocer(id: string): Promise<void> {
    await this.prisma.alerta.update({ where: { id }, data: { reconocida: true } });
  }

  async ultimaDeVariable(variable: TipoVariable): Promise<Alerta | null> {
    const fila = await this.prisma.alerta.findFirst({
      where: { variable },
      orderBy: { timestamp: 'desc' },
    });
    return fila ? aAlerta(fila) : null;
  }
}
