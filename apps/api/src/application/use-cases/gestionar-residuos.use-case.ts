import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EntregaResiduoDto, RegistrarEntregaDto } from '@renova/shared';
import {
  ENTREGA_REPOSITORY,
  EntregaResiduoRepository,
  GENERADOR_REPOSITORY,
  GeneradorRepository,
} from '../../domain/ports/repositorios';
import { CLOCK, Clock, ID_GENERATOR, IdGenerator } from '../../domain/ports/servicios';
import { EntregaResiduo } from '../../domain/generador/entrega-residuo.entity';
import { entregaADto } from '../mappers';

/**
 * Registro de residuo procesado. Hoy la entrada es manual; el día que haya
 * báscula, el adaptador la llamará con origen 'bascula' y nada más cambia.
 */
@Injectable()
export class RegistrarEntregaResiduoUseCase {
  constructor(
    @Inject(ENTREGA_REPOSITORY) private readonly entregas: EntregaResiduoRepository,
    @Inject(GENERADOR_REPOSITORY) private readonly generadores: GeneradorRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
    @Inject(CLOCK) private readonly reloj: Clock,
  ) {}

  async ejecutar(datos: RegistrarEntregaDto): Promise<void> {
    const generador = await this.generadores.buscarPorId(datos.generadorId);
    if (!generador) {
      throw new NotFoundException(`No existe el generador ${datos.generadorId}`);
    }

    const entrega = new EntregaResiduo({
      id: this.ids.nuevo(),
      generadorId: datos.generadorId,
      cantidadKg: datos.cantidadKg,
      fecha: datos.fecha ? new Date(datos.fecha) : this.reloj.ahora(),
      origen: 'manual',
      observaciones: datos.observaciones ?? null,
    });

    await this.entregas.guardar(entrega);
  }
}

@Injectable()
export class ListarEntregasUseCase {
  constructor(@Inject(ENTREGA_REPOSITORY) private readonly entregas: EntregaResiduoRepository) {}

  async ejecutar(limite = 100): Promise<EntregaResiduoDto[]> {
    const entregas = await this.entregas.listar(limite);
    return entregas.map(entregaADto);
  }
}
