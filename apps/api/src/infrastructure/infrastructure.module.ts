import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import {
  ALERTA_REPOSITORY,
  BIODIGESTOR_REPOSITORY,
  ENTREGA_REPOSITORY,
  GENERADOR_REPOSITORY,
  LECTURA_REPOSITORY,
  USUARIO_REPOSITORY,
} from '../domain/ports/repositorios';
import {
  CLOCK,
  EVENT_PUBLISHER,
  ID_GENERATOR,
  PASSWORD_HASHER,
  SENSOR_CLIENT,
  TOKEN_SERVICE,
} from '../domain/ports/servicios';

import { PrismaService } from './persistence/prisma/prisma.service';
import { LecturaPrismaRepository } from './persistence/prisma/lectura.prisma.repository';
import { AlertaPrismaRepository } from './persistence/prisma/alerta.prisma.repository';
import { GeneradorPrismaRepository } from './persistence/prisma/generador.prisma.repository';
import { EntregaPrismaRepository } from './persistence/prisma/entrega.prisma.repository';
import { BiodigestorPrismaRepository } from './persistence/prisma/biodigestor.prisma.repository';
import { UsuarioPrismaRepository } from './persistence/prisma/usuario.prisma.repository';
import { SimuladorSensoresAdapter } from './sensors/simulador-sensores.adapter';
import { SocketEventPublisher } from './realtime/socket-event-publisher';
import { BcryptHasher } from './auth/bcrypt-hasher';
import { JwtTokenService } from './auth/jwt-token.service';
import { SystemClock, UuidGenerator } from './shared/adaptadores-basicos';

/**
 * Único punto donde se decide qué implementación concreta satisface cada puerto.
 *
 * Cambiar de Prisma a otro ORM, o del simulador al hardware real, se hace acá
 * y en ningún otro archivo. Ese es todo el objetivo de la arquitectura hexagonal.
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'renova-dev-secret'),
        // `ms` tipa expiresIn como plantilla literal ('12h', '7d'…); desde .env
        // solo tenemos string, así que el ensanchamiento se resuelve acá.
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '12h') as `${number}h`,
        },
      }),
    }),
  ],
  providers: [
    PrismaService,
    SocketEventPublisher,

    // Puertos de persistencia → adaptadores Prisma/Postgres
    { provide: LECTURA_REPOSITORY, useClass: LecturaPrismaRepository },
    { provide: ALERTA_REPOSITORY, useClass: AlertaPrismaRepository },
    { provide: GENERADOR_REPOSITORY, useClass: GeneradorPrismaRepository },
    { provide: ENTREGA_REPOSITORY, useClass: EntregaPrismaRepository },
    { provide: BIODIGESTOR_REPOSITORY, useClass: BiodigestorPrismaRepository },
    { provide: USUARIO_REPOSITORY, useClass: UsuarioPrismaRepository },

    // Puertos de servicio → adaptadores concretos
    // ↓ Reemplazar por HardwareSensorAdapter cuando llegue el ESP32/PLC
    { provide: SENSOR_CLIENT, useClass: SimuladorSensoresAdapter },
    { provide: EVENT_PUBLISHER, useExisting: SocketEventPublisher },
    { provide: ID_GENERATOR, useClass: UuidGenerator },
    { provide: CLOCK, useClass: SystemClock },
    { provide: PASSWORD_HASHER, useClass: BcryptHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
  ],
  exports: [
    PrismaService,
    SocketEventPublisher,
    LECTURA_REPOSITORY,
    ALERTA_REPOSITORY,
    GENERADOR_REPOSITORY,
    ENTREGA_REPOSITORY,
    BIODIGESTOR_REPOSITORY,
    USUARIO_REPOSITORY,
    SENSOR_CLIENT,
    EVENT_PUBLISHER,
    ID_GENERATOR,
    CLOCK,
    PASSWORD_HASHER,
    TOKEN_SERVICE,
  ],
})
export class InfrastructureModule {}
