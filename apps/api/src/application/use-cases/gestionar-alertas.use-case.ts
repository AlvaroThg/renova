import { Inject, Injectable } from '@nestjs/common';
import { AlertaDto } from '@renova/shared';
import { ALERTA_REPOSITORY, AlertaRepository } from '../../domain/ports/repositorios';
import { alertaADto } from '../mappers';

/** Historial de alertas del piloto y su reconocimiento por el operador. */
@Injectable()
export class GestionarAlertasUseCase {
  constructor(@Inject(ALERTA_REPOSITORY) private readonly alertas: AlertaRepository) {}

  async listar(limite = 100): Promise<AlertaDto[]> {
    const alertas = await this.alertas.listar(limite);
    return alertas.map(alertaADto);
  }

  async contarSinReconocer(): Promise<number> {
    return this.alertas.contarSinReconocer();
  }

  async reconocer(id: string): Promise<void> {
    await this.alertas.reconocer(id);
  }
}
