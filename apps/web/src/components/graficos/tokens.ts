import { COLOR_SERIE_CLARO, COLOR_SERIE_OSCURO, Tema } from '@renova/shared';

export interface TokensGrafico {
  serie: string;
  serieProblema: string;
  rejilla: string;
  eje: string;
  tinta: string;
  tintaFuerte: string;
  superficie: string;
  bordeTooltip: string;
  referencia: string;
}

/**
 * Tokens de los gráficos por tema.
 *
 * No es el set oscuro con la luminosidad invertida: cada tema tiene sus propios
 * pasos, medidos contra la superficie sobre la que se dibuja. El color de serie
 * cambia de familia en claro porque el lima de marca tiene 1,17:1 sobre blanco
 * (ver COLOR_SERIE_CLARO en @renova/shared).
 *
 * Regla que se respeta en ambos: el texto nunca lleva el color de la serie. Los
 * ejes y etiquetas usan tinta; la identidad la carga la marca.
 */
const OSCURO: TokensGrafico = {
  serie: COLOR_SERIE_OSCURO,
  serieProblema: '#E3344E',
  rejilla: '#242B21',
  eje: '#5E6A5A',
  tinta: '#9AA595',
  tintaFuerte: '#E8EDE4',
  superficie: '#101410',
  bordeTooltip: '#242B21',
  referencia: '#5E6A5A',
};

const CLARO: TokensGrafico = {
  serie: COLOR_SERIE_CLARO,
  serieProblema: '#A3182F',
  rejilla: '#E4E7DC',
  eje: '#B4BCA8',
  tinta: '#5A6353',
  tintaFuerte: '#14180F',
  superficie: '#FFFFFF',
  bordeTooltip: '#DFE2D8',
  referencia: '#8B9382',
};

export function tokensGrafico(tema: Tema): TokensGrafico {
  return tema === 'claro' ? CLARO : OSCURO;
}

/** Estilos compartidos del tooltip: mismo lenguaje visual que las tarjetas. */
export function estiloTooltip(t: TokensGrafico) {
  return {
    contentStyle: {
      backgroundColor: t.superficie,
      border: `1px solid ${t.bordeTooltip}`,
      borderRadius: '8px',
      fontSize: '12px',
      color: t.tintaFuerte,
    },
    labelStyle: { color: t.tinta, marginBottom: 4 },
    cursor: { stroke: t.eje, strokeWidth: 1 },
  } as const;
}

export function estiloEje(t: TokensGrafico) {
  return {
    tick: { fill: t.tinta, fontSize: 11 },
    axisLine: { stroke: t.rejilla },
    tickLine: false as const,
  };
}
