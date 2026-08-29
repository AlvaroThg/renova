import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { EntregaResiduoDto } from '@renova/shared';
import {
  ListarEntregasUseCase,
  RegistrarEntregaResiduoUseCase,
} from '../../application/use-cases/gestionar-residuos.use-case';
import { RegistrarEntregaRequestDto } from './dto/peticiones.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/** Registro de residuo procesado — hoy manual, mañana desde la báscula. */
@Controller('residuos')
@UseGuards(JwtAuthGuard)
export class ResiduosController {
  constructor(
    private readonly registrar: RegistrarEntregaResiduoUseCase,
    private readonly listar: ListarEntregasUseCase,
  ) {}

  @Get()
  async obtener(): Promise<EntregaResiduoDto[]> {
    return this.listar.ejecutar();
  }

  @Post()
  @HttpCode(201)
  async registrarEntrega(@Body() datos: RegistrarEntregaRequestDto): Promise<{ ok: true }> {
    await this.registrar.ejecutar(datos);
    return { ok: true };
  }
}
