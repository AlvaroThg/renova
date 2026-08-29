import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../domain/ports/servicios';

interface PayloadToken {
  sub: string;
  email: string;
}

@Injectable()
export class JwtTokenService implements TokenService {
  private readonly logger = new Logger(JwtTokenService.name);

  constructor(private readonly jwt: JwtService) {}

  async firmar(payload: PayloadToken): Promise<string> {
    return this.jwt.signAsync(payload);
  }

  /** Devuelve null en vez de lanzar: quien llama decide si eso es 401 o desconexión. */
  async verificar(token: string): Promise<PayloadToken | null> {
    try {
      return await this.jwt.verifyAsync<PayloadToken>(token);
    } catch {
      return null;
    }
  }
}
