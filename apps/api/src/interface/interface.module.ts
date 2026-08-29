import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { AuthController } from './http/auth.controller';
import { TelemetriaController } from './http/telemetria.controller';
import { ProduccionController } from './http/produccion.controller';
import { ResiduosController } from './http/residuos.controller';
import { GeneradoresController } from './http/generadores.controller';
import { AlertasController } from './http/alertas.controller';
import { TelemetriaGateway } from './ws/telemetria.gateway';
import { JwtAuthGuard } from './http/guards/jwt-auth.guard';

/** Adaptadores de entrada: HTTP y WebSocket. Nada más que traducción. */
@Module({
  imports: [ApplicationModule],
  controllers: [
    AuthController,
    TelemetriaController,
    ProduccionController,
    ResiduosController,
    GeneradoresController,
    AlertasController,
  ],
  providers: [TelemetriaGateway, JwtAuthGuard],
})
export class InterfaceModule {}
