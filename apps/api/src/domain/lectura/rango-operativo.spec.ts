import { RANGOS_OPERATIVOS, RangoOperativo, rangoDe } from './rango-operativo';
import { TIPOS_VARIABLE } from '@renova/shared';

describe('RangoOperativo', () => {
  describe('evaluar', () => {
    const rango = rangoDe('temperatura'); // óptimo 33-37, alerta 30-40

    it('marca normal dentro del óptimo', () => {
      expect(rango.evaluar(35)).toBe('normal');
    });

    it('incluye los bordes del óptimo como normal', () => {
      expect(rango.evaluar(33)).toBe('normal');
      expect(rango.evaluar(37)).toBe('normal');
    });

    it('marca alerta entre el óptimo y el límite de alerta', () => {
      expect(rango.evaluar(31)).toBe('alerta');
      expect(rango.evaluar(38.5)).toBe('alerta');
    });

    it('marca crítico fuera del rango de alerta', () => {
      expect(rango.evaluar(29.9)).toBe('critico');
      expect(rango.evaluar(41)).toBe('critico');
    });
  });

  describe('tabla de rangos del piloto', () => {
    it('define un rango para cada variable monitoreada', () => {
      for (const variable of TIPOS_VARIABLE) {
        expect(RANGOS_OPERATIVOS[variable]).toBeInstanceOf(RangoOperativo);
      }
    });

    it('mantiene los valores de digestión mesofílica del pitch', () => {
      expect(rangoDe('temperatura').evaluar(34)).toBe('normal'); // 33-37 °C
      expect(rangoDe('ph').evaluar(7.0)).toBe('normal'); // 6.8-7.2
      expect(rangoDe('presion').evaluar(0.035)).toBe('normal'); // 0.02-0.05 bar
    });

    it('detecta H₂S peligroso por encima de 500 ppm', () => {
      expect(rangoDe('h2s').evaluar(150)).toBe('normal');
      expect(rangoDe('h2s').evaluar(350)).toBe('alerta');
      expect(rangoDe('h2s').evaluar(600)).toBe('critico');
    });

    it('detecta metano bajo, que arruina el poder calorífico del biogás', () => {
      expect(rangoDe('ch4').evaluar(62)).toBe('normal');
      expect(rangoDe('ch4').evaluar(52)).toBe('alerta');
      expect(rangoDe('ch4').evaluar(45)).toBe('critico');
    });
  });

  it('rechaza un rango de alerta que no contenga al óptimo', () => {
    expect(() => RangoOperativo.crear('temperatura', [33, 37], [34, 36])).toThrow(
      /debe contener al óptimo/,
    );
  });

  it('calcula el setpoint como el centro del óptimo', () => {
    expect(rangoDe('temperatura').setpoint).toBe(35);
    expect(rangoDe('ph').setpoint).toBeCloseTo(7.0, 5);
  });
});
