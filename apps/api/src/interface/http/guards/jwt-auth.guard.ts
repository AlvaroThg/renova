import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { TOKEN_SERVICE, TokenService } from '../../../domain/ports/servicios';

/** Protege las rutas del sistema de gestión. La landing no pasa por acá. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(TOKEN_SERVICE) private readonly tokens: TokenService) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const req = contexto.switchToHttp().getRequest<Request & { usuario?: unknown }>();
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el token de acceso');
    }

    const payload = await this.tokens.verificar(header.slice('Bearer '.length));
    if (!payload) throw new UnauthorizedException('Token inválido o expirado');

    req.usuario = payload;
    return true;
  }
}
