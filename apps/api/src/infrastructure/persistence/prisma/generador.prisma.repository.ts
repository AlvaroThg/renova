import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { GeneradorRepository } from '../../../domain/ports/repositorios';
import { Generador } from '../../../domain/generador/generador.entity';
import { aGenerador } from './prisma.mappers';

@Injectable()
export class GeneradorPrismaRepository implements GeneradorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<Generador[]> {
    const filas = await this.prisma.generador.findMany({ orderBy: { nombre: 'asc' } });
    return filas.map(aGenerador);
  }

  async buscarPorId(id: string): Promise<Generador | null> {
    const fila = await this.prisma.generador.findUnique({ where: { id } });
    return fila ? aGenerador(fila) : null;
  }

  async guardar(generador: Generador): Promise<void> {
    const datos = {
      nombre: generador.nombre,
      tipo: generador.tipo,
      direccion: generador.direccion,
      contacto: generador.contacto,
      activo: generador.activo,
    };
    await this.prisma.generador.upsert({
      where: { id: generador.id },
      create: { id: generador.id, creadoEn: generador.creadoEn, ...datos },
      update: datos,
    });
  }

  async eliminar(id: string): Promise<void> {
    try {
      await this.prisma.generador.delete({ where: { id } });
    } catch (error) {
      // P2003: hay entregas de residuo apuntando a este generador. Borrarlo
      // destruiría el histórico de producción, así que se ofrece desactivarlo.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException(
          'El generador tiene entregas registradas y no puede eliminarse. Desactivalo en su lugar.',
        );
      }
      throw error;
    }
  }
}
