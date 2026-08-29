'use client';

import { useState } from 'react';
import { RangoProduccion } from '@renova/shared';
import { api } from '@/lib/api/client';
import { useConsulta } from '@/lib/api/useConsulta';
import { EncabezadoVista } from '@/components/dashboard/BarraLateral';
import { GraficoProduccion } from '@/components/graficos/GraficoProduccion';
import { bolivianos, kilos, metrosCubicos } from '@/lib/formato';

const RANGOS: Array<{ valor: RangoProduccion; etiqueta: string }> = [
  { valor: 'dia', etiqueta: 'Hoy' },
  { valor: 'semana', etiqueta: 'Últimos 7 días' },
  { valor: 'mes', etiqueta: 'Últimos 30 días' },
];

export default function VistaProduccion() {
  const [rango, setRango] = useState<RangoProduccion>('semana');
  const { datos, cargando } = useConsulta(() => api.produccion(rango), [rango]);

  const porDebajo = (datos?.desvioPorcentual ?? 0) < 0;

  return (
    <div className="p-8">
      <EncabezadoVista
        titulo="Producción de biogás"
        descripcion="Derivada del residuo efectivamente recibido, contra el escenario base del pitch."
      >
        {/* Filtros en una fila, arriba del gráfico. */}
        <div className="flex gap-1 rounded-lg border border-borde p-1">
          {RANGOS.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => setRango(opcion.valor)}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                rango === opcion.valor
                  ? 'bg-superficie-alta font-medium text-acento'
                  : 'text-texto-tenue hover:text-texto'
              }`}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>
      </EncabezadoVista>

      {cargando && <p className="text-sm text-texto-tenue">Calculando producción…</p>}

      {datos && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metrica etiqueta="Biogás acumulado" valor={metrosCubicos(datos.biogasM3)} />
            <Metrica etiqueta="Residuo procesado" valor={kilos(datos.residuoKg)} />
            <Metrica etiqueta="Ingreso estimado" valor={bolivianos(datos.ingresoBs)} />
            <div className="tarjeta">
              <p className="text-xs text-texto-tenue">Contra escenario base</p>
              <p className="mt-2 flex items-baseline gap-2 text-2xl font-semibold">
                <span className={porDebajo ? 'text-estado-alerta' : 'text-estado-normal'}>
                  {datos.desvioPorcentual > 0 ? '+' : ''}
                  {datos.desvioPorcentual.toFixed(1)} %
                </span>
                <span aria-hidden className="text-sm">
                  {porDebajo ? '▼' : '▲'}
                </span>
              </p>
              <p className="mt-2 text-[11px] text-texto-debil">
                Base del período: {datos.baseM3.toLocaleString('es-BO')} m³
              </p>
            </div>
          </div>

          <div className="tarjeta mt-6">
            <h2 className="mb-4 text-base font-semibold">Producción diaria</h2>
            <GraficoProduccion produccion={datos} />
          </div>
        </>
      )}
    </div>
  );
}

function Metrica({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="tarjeta">
      <p className="text-xs text-texto-tenue">{etiqueta}</p>
      <p className="mt-2 text-2xl font-semibold text-texto">{valor}</p>
    </div>
  );
}
