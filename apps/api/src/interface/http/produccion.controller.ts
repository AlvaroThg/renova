import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProduccionDto } from '@renova/shared';
import { CalcularProduccionUseCase } from '../../application/use-cases/calcular-produccion.use-case';
import { ProduccionQueryDto } from './dto/peticiones.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('produccion')
@UseGuards(JwtAuthGuard)
export class ProduccionController {
  constructor(private readonly produccion: CalcularProduccionUseCase) {}

  @Get()
  async obtener(@Query() query: ProduccionQueryDto): Promise<ProduccionDto> {
    return this.produccion.ejecutar(query.rango ?? 'dia');
  }
}
