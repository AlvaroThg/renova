import { Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AlertaDto } from '@renova/shared';
import { GestionarAlertasUseCase } from '../../application/use-cases/gestionar-alertas.use-case';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('alertas')
@UseGuards(JwtAuthGuard)
export class AlertasController {
  constructor(private readonly alertas: GestionarAlertasUseCase) {}

  @Get()
  async listar(): Promise<AlertaDto[]> {
    return this.alertas.listar();
  }

  @Post(':id/reconocer')
  @HttpCode(204)
  async reconocer(@Param('id') id: string): Promise<void> {
    await this.alertas.reconocer(id);
  }
}
