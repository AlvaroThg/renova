/** Formateo consistente de las cifras del piloto en toda la interfaz. */

/** Bolivianos: sin centavos — a esta escala el decimal es ruido. */
export function bolivianos(valor: number): string {
  return `Bs ${Math.round(valor).toLocaleString('es-BO')}`;
}

/** Volumen de biogás en metros cúbicos, con un decimal. */
export function metrosCubicos(valor: number): string {
  return `${valor.toLocaleString('es-BO', { maximumFractionDigits: 1 })} m³`;
}

/** Peso de residuo en kilos, sin decimales. */
export function kilos(valor: number): string {
  return `${Math.round(valor).toLocaleString('es-BO')} kg`;
}
