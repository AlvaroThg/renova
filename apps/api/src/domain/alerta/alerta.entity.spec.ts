import { Alerta } from './alerta.entity';
import { Lectura } from '../lectura/lectura.entity';

function lectura(variable: 'temperatura' | 'ph' | 'h2s', valor: number): Lectura {
  return new Lectura({
    id: 'l1',
    sensorId: 's1',
    variable,
    zona: variable === 'h2s' ? 'gasometro' : 'biodigestor',
    valor,
    timestamp: new Date('2026-08-29T12:00:00Z'),
  });
}

describe('Alerta.desdeLectura', () => {
  it('no genera alerta cuando la lectura está en rango', () => {
    expect(Alerta.desdeLectura(lectura('temperatura', 35), 'a1')).toBeNull();
  });

  it('genera severidad alerta cuando la lectura está en zona de alerta', () => {
    const alerta = Alerta.desdeLectura(lectura('temperatura', 38.5), 'a1');
    expect(alerta?.severidad).toBe('alerta');
    expect(alerta?.mensaje).toContain('Temperatura');
    expect(alerta?.mensaje).toContain('por encima del óptimo');
  });

  it('genera severidad crítica fuera del rango de alerta', () => {
    const alerta = Alerta.desdeLectura(lectura('temperatura', 45), 'a1');
    expect(alerta?.severidad).toBe('critico');
    expect(alerta?.mensaje).toMatch(/^CRÍTICO/);
  });

  it('describe el desvío hacia abajo cuando el pH se acidifica', () => {
    const alerta = Alerta.desdeLectura(lectura('ph', 6.6), 'a1');
    expect(alerta?.severidad).toBe('alerta');
    expect(alerta?.mensaje).toContain('por debajo del óptimo');
  });

  it('hereda zona y timestamp de la lectura que la originó', () => {
    const origen = lectura('h2s', 700);
    const alerta = Alerta.desdeLectura(origen, 'a1');
    expect(alerta?.zona).toBe('gasometro');
    expect(alerta?.timestamp).toEqual(origen.timestamp);
    expect(alerta?.reconocida).toBe(false);
  });
});

describe('Lectura', () => {
  it('calcula su propio estado a partir del rango operativo', () => {
    expect(lectura('temperatura', 35).estado).toBe('normal');
    expect(lectura('temperatura', 31).estado).toBe('alerta');
    expect(lectura('temperatura', 20).estado).toBe('critico');
  });

  it('redondea el valor a los decimales de la variable', () => {
    expect(lectura('ph', 7.123456).valorPresentable).toBe(7.12);
    expect(lectura('h2s', 187.6).valorPresentable).toBe(188);
  });

  it('rechaza valores no finitos', () => {
    expect(() => lectura('temperatura', NaN)).toThrow(/inválido/);
  });
});
