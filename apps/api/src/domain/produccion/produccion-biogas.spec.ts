import { ProduccionBiogas } from './produccion-biogas';
import { BIOGAS_BASE_M3_DIA, INGRESO_BASE_BS_MES } from '@renova/shared';

describe('ProduccionBiogas', () => {
  it('convierte los 2.000 kg/día del escenario base en ~350 m³ de biogás', () => {
    expect(ProduccionBiogas.biogasDesdeResiduo(2000)).toBeCloseTo(350, 5);
    expect(BIOGAS_BASE_M3_DIA).toBeCloseTo(350, 5);
  });

  it('reproduce el ingreso mensual de Bs 21.000 del pitch', () => {
    const biogasMes = ProduccionBiogas.biogasDesdeResiduo(2000) * 30;
    expect(ProduccionBiogas.ingresoDesdeBiogas(biogasMes)).toBeCloseTo(21000, 5);
    expect(INGRESO_BASE_BS_MES).toBeCloseTo(21000, 5);
  });

  it('escala linealmente con el residuo recibido', () => {
    expect(ProduccionBiogas.biogasDesdeResiduo(1000)).toBeCloseTo(175, 5);
    expect(ProduccionBiogas.biogasDesdeResiduo(0)).toBe(0);
  });

  it('rechaza cantidades negativas', () => {
    expect(() => ProduccionBiogas.biogasDesdeResiduo(-1)).toThrow();
    expect(() => ProduccionBiogas.ingresoDesdeBiogas(-1)).toThrow();
  });

  describe('desvío contra el escenario base', () => {
    it('es 0 cuando la producción iguala la base', () => {
      expect(ProduccionBiogas.desvioPorcentual(350, 350)).toBe(0);
    });

    it('es positivo por encima de la base', () => {
      expect(ProduccionBiogas.desvioPorcentual(420, 350)).toBeCloseTo(20, 5);
    });

    it('es negativo por debajo de la base', () => {
      expect(ProduccionBiogas.desvioPorcentual(280, 350)).toBeCloseTo(-20, 5);
    });

    it('devuelve 0 en vez de dividir por cero cuando no hay base', () => {
      expect(ProduccionBiogas.desvioPorcentual(100, 0)).toBe(0);
    });
  });

  describe('diasEntre', () => {
    it('cuenta un rango de horas como un día', () => {
      const desde = new Date('2026-08-29T00:00:00Z');
      const hasta = new Date('2026-08-29T10:00:00Z');
      expect(ProduccionBiogas.diasEntre(desde, hasta)).toBe(1);
    });

    it('cuenta 7 días para el rango semanal', () => {
      const desde = new Date('2026-08-23T00:00:00Z');
      const hasta = new Date('2026-08-29T23:59:59Z');
      expect(ProduccionBiogas.diasEntre(desde, hasta)).toBe(7);
    });
  });

  it('proyecta la base multiplicando por días', () => {
    expect(ProduccionBiogas.baseParaDias(7)).toBeCloseTo(2450, 5);
    expect(ProduccionBiogas.baseParaDias(30)).toBeCloseTo(10500, 5);
  });
});
