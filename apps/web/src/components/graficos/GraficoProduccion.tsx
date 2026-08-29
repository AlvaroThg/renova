'use client';

import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BIOGAS_BASE_M3_DIA, ProduccionDto } from '@renova/shared';
import { useTema } from '@/lib/tema';
import { estiloEje, estiloTooltip, tokensGrafico } from './tokens';

/**
 * Producción diaria de biogás contra el escenario base de 350 m³/día.
 *
 * Una serie de barras y una línea de referencia — no dos ejes. El lector tiene
 * una sola pregunta: ¿llegamos o no llegamos a la base?
 */
export function GraficoProduccion({ produccion }: { produccion: ProduccionDto }) {
  const [verTabla, setVerTabla] = useState(false);
  const { tema } = useTema();
  const t = tokensGrafico(tema);

  const datos = produccion.serie.map((punto) => ({
    fecha: new Date(`${punto.fecha}T00:00:00`).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
    }),
    biogas: punto.biogasM3,
    residuo: punto.residuoKg,
  }));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-texto-tenue">
          Biogás por día en m³ · la línea marca el escenario base de {BIOGAS_BASE_M3_DIA} m³/día
        </p>
        <button
          type="button"
          onClick={() => setVerTabla((v) => !v)}
          className="text-xs text-texto-tenue underline decoration-borde underline-offset-4 hover:text-acento"
        >
          {verTabla ? 'Ver gráfico' : 'Ver tabla'}
        </button>
      </div>

      {verTabla ? (
        <div className="max-h-[300px] overflow-y-auto rounded-lg border border-borde">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-superficie-alta text-texto-tenue">
              <tr>
                <th className="px-3 py-2 font-medium">Fecha</th>
                <th className="px-3 py-2 text-right font-medium">Residuo (kg)</th>
                <th className="px-3 py-2 text-right font-medium">Biogás (m³)</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {datos.map((fila) => (
                <tr key={fila.fecha} className="border-t border-borde/60">
                  <td className="px-3 py-1.5 text-texto-tenue">{fila.fecha}</td>
                  <td className="px-3 py-1.5 text-right">{fila.residuo.toLocaleString('es-BO')}</td>
                  <td className="px-3 py-1.5 text-right text-texto">
                    {fila.biogas.toLocaleString('es-BO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos} margin={{ top: 12, right: 16, bottom: 4, left: 0 }} barGap={2}>
              <CartesianGrid stroke={t.rejilla} strokeWidth={1} vertical={false} />
              <XAxis dataKey="fecha" {...estiloEje(t)} minTickGap={24} />
              <YAxis {...estiloEje(t)} width={52} />
              <Tooltip
                {...estiloTooltip(t)}
                cursor={{ fill: t.tinta, fillOpacity: 0.07 }}
                formatter={(valor: number) => [`${valor} m³`, 'Biogás']}
              />
              <ReferenceLine
                y={BIOGAS_BASE_M3_DIA}
                stroke={t.referencia}
                strokeWidth={1}
                label={{
                  value: 'Base 350 m³',
                  position: 'insideTopRight',
                  fill: t.tinta,
                  fontSize: 11,
                }}
              />
              {/* Barras finas con extremo redondeado y base cuadrada sobre la línea cero. */}
              <Bar
                dataKey="biogas"
                fill={t.serie}
                maxBarSize={24}
                radius={[4, 4, 0, 0]}
                // Entrada breve: el gráfico se rearma al cambiar de rango y al
                // redimensionar, y una animación larga se vuelve ruido repetido.
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
