import { Module } from '@nestjs/common';
import { RegistrarLecturaUseCase } from './use-cases/registrar-lectura.use-case';
import { ObtenerEstadoActualUseCase } from './use-cases/obtener-estado-actual.use-case';
import { ObtenerHistoricoUseCase } from './use-cases/obtener-historico.use-case';
import { CalcularProduccionUseCase } from './use-cases/calcular-produccion.use-case';
import {
  ListarEntregasUseCase,
  RegistrarEntregaResiduoUseCase,
} from './use-cases/gestionar-residuos.use-case';
import { GestionarGeneradoresUseCase } from './use-cases/gestionar-generadores.use-case';
import { GestionarAlertasUseCase } from './use-cases/gestionar-alertas.use-case';
import { ObtenerResumenUseCase } from './use-cases/obtener-resumen.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

/**
 * Los casos de uso solo dependen de los puertos del dominio.
 * InfrastructureModule es quien decide qué adaptador concreto satisface cada token.
 */
const CASOS_DE_USO = [
  RegistrarLecturaUseCase,
  ObtenerEstadoActualUseCase,
  ObtenerHistoricoUseCase,
  CalcularProduccionUseCase,
  RegistrarEntregaResiduoUseCase,
  ListarEntregasUseCase,
  GestionarGeneradoresUseCase,
  GestionarAlertasUseCase,
  ObtenerResumenUseCase,
  LoginUseCase,
];

@Module({
  imports: [InfrastructureModule],
  providers: CASOS_DE_USO,
  exports: CASOS_DE_USO,
})
export class ApplicationModule {}
