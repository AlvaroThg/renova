'use client';

import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { HistoricoDto, META_VARIABLES, TipoVariable } from '@renova/shared';
import { useTema } from '@/lib/tema';
import { RANGOS_UI } from '@/lib/rangos';
import { estiloEje, estiloTooltip, tokensGrafico } from './tokens';

interface Props {
  historico: HistoricoDto;
  variable: TipoVariable;
}

/**
 * Serie de 24 h de una variable de proceso, contra su rango óptimo.
 *
 * Una sola serie y una banda de contexto: el operador no compara variables entre
 * sí, compara una variable contra dónde debería estar. Por eso no hay leyenda ni
 * un segundo eje — la banda dice todo lo que hace falta.
 */
export function GraficoLinea24h({ historico, variable }: Props) {
  const [verTabla, setVerTabla] = useState(false);
  const { tema } = useTema();
  const t = tokensGrafico(tema);
  const meta = META_VARIABLES[variable];
  const rango = RANGOS_UI[variable];
  const margen = (rango.optimoMax - rango.optimoMin) * 0.35;

  // El eje va sobre el timestamp real, no sobre el índice del punto: las lecturas
  // del histórico están cada 10 min y las nuevas cada 3 s, así que un eje
  // categórico mostraría las últimas horas estiradas y el resto comprimido.
  const datos = historico.puntos.map((p) => ({
    t: new Date(p.timestamp).getTime(),
    valor: p.valor,
  }));

  const formatearHora = (marca: number) =>
    new Date(marca).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-texto-tenue">
          Últimas 24 h · rango óptimo {rango.optimoMin}–{rango.optimoMax} {meta.unidad}
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
        <TablaSerie
          datos={datos.map((p) => ({ hora: formatearHora(p.t), valor: p.valor }))}
          unidad={meta.unidad}
        />
      ) : (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datos} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={t.rejilla} strokeWidth={1} vertical={false} />
              {/* Banda del rango óptimo: contexto recesivo, nunca compite con el dato. */}
              <ReferenceArea
                y1={rango.optimoMin}
                y2={rango.optimoMax}
                fill={t.serie}
                fillOpacity={tema === 'claro' ? 0.1 : 0.07}
                stroke="none"
              />
              <XAxis
                dataKey="t"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatearHora}
                minTickGap={56}
                {...estiloEje(t)}
              />
              <YAxis
                {...estiloEje(t)}
                width={48}
                // El dominio siempre encierra al rango óptimo con algo de aire:
                // si se ajustara solo a los datos, la banda cubriría todo el
                // gráfico y dejaría de leerse como banda cuando todo está en rango.
                domain={[
                  (min: number) => Math.min(min - margen * 0.5, rango.optimoMin - margen),
                  (max: number) => Math.max(max + margen * 0.5, rango.optimoMax + margen),
                ]}
                tickFormatter={(v: number) => v.toFixed(meta.decimales === 0 ? 0 : 1)}
              />
              <Tooltip
                {...estiloTooltip(t)}
                labelFormatter={(marca: number) => formatearHora(marca)}
                formatter={(valor: number) => [`${valor} ${meta.unidad}`.trim(), meta.etiqueta]}
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={t.serie}
                strokeWidth={2}
                strokeLinecap="round"
                dot={false}
                activeDot={{ r: 4.5, strokeWidth: 2, stroke: t.superficie }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/** Vista de tabla: el mismo dato sin depender del color ni de la vista. */
function TablaSerie({
  datos,
  unidad,
}: {
  datos: Array<{ hora: string; valor: number }>;
  unidad: string;
}) {
  return (
    <div className="h-[260px] overflow-y-auto rounded-lg border border-borde">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-superficie-alta text-texto-tenue">
          <tr>
            <th className="px-3 py-2 font-medium">Hora</th>
            <th className="px-3 py-2 text-right font-medium">Valor {unidad}</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {datos.map((punto, i) => (
            <tr key={i} className="border-t border-borde/60">
              <td className="px-3 py-1.5 text-texto-tenue">{punto.hora}</td>
              <td className="px-3 py-1.5 text-right text-texto">{punto.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
