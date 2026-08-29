import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PasswordHasher } from '../../domain/ports/servicios';

@Injectable()
export class BcryptHasher implements PasswordHasher {
  private static readonly RONDAS = 10;

  async hashear(plano: string): Promise<string> {
    return bcrypt.hash(plano, BcryptHasher.RONDAS);
  }

  async verificar(plano: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plano, hash);
  }
}
