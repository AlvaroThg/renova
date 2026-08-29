import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthResponseDto, LoginDto } from '@renova/shared';
import { USUARIO_REPOSITORY, UsuarioRepository } from '../../domain/ports/repositorios';
import {
  PASSWORD_HASHER,
  PasswordHasher,
  TOKEN_SERVICE,
  TokenService,
} from '../../domain/ports/servicios';

/** Autenticación del operador del piloto contra el usuario creado por el seed. */
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async ejecutar(datos: LoginDto): Promise<AuthResponseDto> {
    const usuario = await this.usuarios.buscarPorEmail(datos.email.trim().toLowerCase());
    // Mismo mensaje para usuario inexistente y contraseña incorrecta: no revelamos cuál falló.
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const valida = await this.hasher.verificar(datos.password, usuario.passwordHash);
    if (!valida) throw new UnauthorizedException('Credenciales inválidas');

    const accessToken = await this.tokens.firmar({ sub: usuario.id, email: usuario.email });
    return {
      accessToken,
      usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    };
  }
}
