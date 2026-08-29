import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ApplicationModule } from './application/application.module';
import { InterfaceModule } from './interface/interface.module';
import { SimuladorModule } from './infrastructure/sensors/simulador.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    ApplicationModule,
    InterfaceModule,
    SimuladorModule,
  ],
})
export class AppModule {}
