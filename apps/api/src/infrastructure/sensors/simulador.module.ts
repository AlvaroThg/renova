import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ApplicationModule } from '../../application/application.module';
import { SimuladorScheduler } from './simulador.scheduler';

/**
 * Módulo aparte para el temporizador de muestreo.
 *
 * Va separado de InfrastructureModule porque el scheduler consume casos de uso,
 * y ApplicationModule ya depende de InfrastructureModule: meterlo ahí crearía
 * una dependencia circular entre módulos.
 */
@Module({
  imports: [ScheduleModule.forRoot(), ApplicationModule],
  providers: [SimuladorScheduler],
})
export class SimuladorModule {}
