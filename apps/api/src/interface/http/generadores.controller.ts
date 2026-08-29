import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GeneradorDto } from '@renova/shared';
import { GestionarGeneradoresUseCase } from '../../application/use-cases/gestionar-generadores.use-case';
import {
  ActualizarGeneradorRequestDto,
  CrearGeneradorRequestDto,
} from './dto/peticiones.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/** Puntos de origen del residuo: Mercado Campesino y demás generadores. */
@Controller('generadores')
@UseGuards(JwtAuthGuard)
export class GeneradoresController {
  constructor(private readonly generadores: GestionarGeneradoresUseCase) {}

  @Get()
  async listar(): Promise<GeneradorDto[]> {
    return this.generadores.listar();
  }

  @Post()
  @HttpCode(201)
  async crear(@Body() datos: CrearGeneradorRequestDto): Promise<GeneradorDto> {
    return this.generadores.crear(datos);
  }

  @Patch(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() cambios: ActualizarGeneradorRequestDto,
  ): Promise<GeneradorDto> {
    return this.generadores.actualizar(id, cambios);
  }

  @Delete(':id')
  @HttpCode(204)
  async eliminar(@Param('id') id: string): Promise<void> {
    await this.generadores.eliminar(id);
  }
}
