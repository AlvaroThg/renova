import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadoZonaDto, HistoricoDto, ResumenDto } from '@renova/shared';
import { ObtenerEstadoActualUseCase } from '../../application/use-cases/obtener-estado-actual.use-case';
import { ObtenerHistoricoUseCase } from '../../application/use-cases/obtener-historico.use-case';
import { ObtenerResumenUseCase } from '../../application/use-cases/obtener-resumen.use-case';
import { HistoricoQueryDto } from './dto/peticiones.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/** Estado y series de las variables de proceso. Solo traduce HTTP → caso de uso. */
@Controller('telemetria')
@UseGuards(JwtAuthGuard)
export class TelemetriaController {
  constructor(
    private readonly estadoActual: ObtenerEstadoActualUseCase,
    private readonly historico: ObtenerHistoricoUseCase,
    private readonly resumen: ObtenerResumenUseCase,
  ) {}

  /** Estado inicial del dashboard; a partir de acá lo mantiene el WebSocket. */
  @Get('estado')
  async obtenerEstado(): Promise<EstadoZonaDto[]> {
    return this.estadoActual.ejecutar();
  }

  @Get('historico')
  async obtenerHistorico(@Query() query: HistoricoQueryDto): Promise<HistoricoDto> {
    return this.historico.ejecutar(query.variable, query.horas ?? 24);
  }

  @Get('resumen')
  async obtenerResumen(): Promise<ResumenDto> {
    return this.resumen.ejecutar();
  }
}
