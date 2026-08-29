import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Clock, IdGenerator } from '../../domain/ports/servicios';

/** El dominio pide identidades sin saber que son UUID v4. */
@Injectable()
export class UuidGenerator implements IdGenerator {
  nuevo(): string {
    return randomUUID();
  }
}

/** Reloj del sistema. Inyectarlo permite congelar el tiempo en los tests. */
@Injectable()
export class SystemClock implements Clock {
  ahora(): Date {
    return new Date();
  }
}
