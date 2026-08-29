import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthResponseDto } from '@renova/shared';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LoginRequestDto } from './dto/peticiones.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly login: LoginUseCase) {}

  @Post('login')
  @HttpCode(200)
  async iniciarSesion(@Body() datos: LoginRequestDto): Promise<AuthResponseDto> {
    return this.login.ejecutar(datos);
  }

  /** Permite al frontend saber si el token guardado sigue siendo válido. */
  @Get('yo')
  @UseGuards(JwtAuthGuard)
  yo(@Req() req: Request & { usuario?: { sub: string; email: string } }) {
    return { id: req.usuario?.sub, email: req.usuario?.email };
  }
}
