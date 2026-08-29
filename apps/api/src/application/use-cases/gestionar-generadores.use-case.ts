import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ActualizarGeneradorDto, CrearGeneradorDto, GeneradorDto } from '@renova/shared';
import {
  ENTREGA_REPOSITORY,
  EntregaResiduoRepository,
  GENERADOR_REPOSITORY,
  GeneradorRepository,
} from '../../domain/ports/repositorios';
import { ID_GENERATOR, IdGenerator } from '../../domain/ports/servicios';
import { Generador } from '../../domain/generador/generador.entity';
import { generadorADto } from '../mappers';

/** CRUD de los puntos de origen del residuo, con su volumen histórico entregado. */
@Injectable()
export class GestionarGeneradoresUseCase {
  constructor(
    @Inject(GENERADOR_REPOSITORY) private readonly generadores: GeneradorRepository,
    @Inject(ENTREGA_REPOSITORY) private readonly entregas: EntregaResiduoRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async listar(): Promise<GeneradorDto[]> {
    const [generadores, totales] = await Promise.all([
      this.generadores.listar(),
      this.entregas.totalesPorGenerador(),
    ]);
    return generadores.map((g) => generadorADto(g, totales.get(g.id)));
  }

  async crear(datos: CrearGeneradorDto): Promise<GeneradorDto> {
    const generador = new Generador({ id: this.ids.nuevo(), ...datos });
    await this.generadores.guardar(generador);
    return generadorADto(generador);
  }

  async actualizar(id: string, cambios: ActualizarGeneradorDto): Promise<GeneradorDto> {
    const generador = await this.exigir(id);
    const actualizado = generador.con(cambios);
    await this.generadores.guardar(actualizado);
    const totales = await this.entregas.totalesPorGenerador();
    return generadorADto(actualizado, totales.get(id));
  }

  async eliminar(id: string): Promise<void> {
    await this.exigir(id);
    await this.generadores.eliminar(id);
  }

  private async exigir(id: string): Promise<Generador> {
    const generador = await this.generadores.buscarPorId(id);
    if (!generador) throw new NotFoundException(`No existe el generador ${id}`);
    return generador;
  }
}
