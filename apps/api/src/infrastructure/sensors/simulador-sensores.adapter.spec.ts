import { META_VARIABLES, TIPOS_VARIABLE } from '@renova/shared';
import { SimuladorSensoresAdapter } from './simulador-sensores.adapter';
import { BiodigestorRepository } from '../../domain/ports/repositorios';
import { Clock } from '../../domain/ports/servicios';
import { Sensor } from '../../domain/biodigestor/biodigestor.entity';

const sensores: Sensor[] = TIPOS_VARIABLE.map(
  (variable, i) =>
    new Sensor({
      id: `s${i}`,
      variable,
      zona: META_VARIABLES[variable].zona,
      etiqueta: META_VARIABLES[variable].etiqueta,
    }),
);

const repositorio = {
  sensoresActivos: async () => sensores,
  principal: async () => null,
  sensorDe: async () => null,
} as unknown as BiodigestorRepository;

const reloj: Clock = { ahora: () => new Date() };

describe('SimuladorSensoresAdapter', () => {
  it('entrega una medición por cada sensor activo', async () => {
    const simulador = new SimuladorSensoresAdapter(repositorio, reloj);
    const mediciones = await simulador.muestrear();
    expect(mediciones).toHaveLength(TIPOS_VARIABLE.length);
    expect(new Set(mediciones.map((m) => m.variable)).size).toBe(TIPOS_VARIABLE.length);
  });

  /**
   * Regresión: el random walk podía cruzar el cero y reportar H₂S en −9 ppm o
   * presión negativa, que ningún sensor real entrega y que ensuciaba el
   * historial de alertas con lecturas físicamente imposibles.
   */
  it('nunca reporta valores fuera del rango físico de la variable', async () => {
    const simulador = new SimuladorSensoresAdapter(repositorio, reloj);

    // Muchas muestras para que las excursiones se disparen y empujen los extremos.
    for (let i = 0; i < 800; i++) {
      const mediciones = await simulador.muestrear();
      for (const medicion of mediciones) {
        const { escala } = META_VARIABLES[medicion.variable];
        expect(medicion.valor).toBeGreaterThanOrEqual(escala.min);
        expect(medicion.valor).toBeLessThanOrEqual(escala.max);
      }
    }
  });

  it('mantiene continuidad entre muestras: no hay saltos bruscos', async () => {
    const simulador = new SimuladorSensoresAdapter(repositorio, reloj);
    const primera = await simulador.muestrear();
    const anteriores = new Map(primera.map((m) => [m.variable, m.valor]));

    for (let i = 0; i < 50; i++) {
      for (const medicion of await simulador.muestrear()) {
        const previo = anteriores.get(medicion.variable)!;
        const { escala } = META_VARIABLES[medicion.variable];
        const amplitud = escala.max - escala.min;
        // Un sensor real no salta media escala entre dos lecturas consecutivas.
        expect(Math.abs(medicion.valor - previo)).toBeLessThan(amplitud * 0.5);
        anteriores.set(medicion.variable, medicion.valor);
      }
    }
  });
});
