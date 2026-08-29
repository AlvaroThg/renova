import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsuarioAutenticable, UsuarioRepository } from '../../../domain/ports/repositorios';

@Injectable()
export class UsuarioPrismaRepository implements UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorEmail(email: string): Promise<UsuarioAutenticable | null> {
    const fila = await this.prisma.usuario.findUnique({ where: { email } });
    if (!fila) return null;
    return {
      id: fila.id,
      email: fila.email,
      nombre: fila.nombre,
      passwordHash: fila.passwordHash,
    };
  }
}
