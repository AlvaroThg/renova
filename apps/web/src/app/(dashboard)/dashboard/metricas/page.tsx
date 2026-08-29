'use client';

import { useState } from 'react';
import { META_VARIABLES, TIPOS_VARIABLE, TipoVariable } from '@renova/shared';
import { api } from '@/lib/api/client';
import { useConsulta } from '@/lib/api/useConsulta';
import { useTelemetriaCompartida } from '@/lib/api/ProveedorTelemetria';
import { EncabezadoVista } from '@/components/dashboard/BarraLateral';
import { GaugeCircular } from '@/components/ui/GaugeCircular';
import { GraficoLinea24h } from '@/components/graficos/GraficoLinea24h';

export default function VistaMetricas() {
  const { lecturas, conectado } = useTelemetriaCompartida();
  const [variable, setVariable] = useState<TipoVariable>('temperatura');

  const { datos: historico, cargando } = useConsulta(
    () => api.historico(variable, 24),
    [variable],
  );

  return (
    <div className="p-8">
      <EncabezadoVista
        titulo="Métricas en vivo"
        descripcion="Las siete variables de proceso del piloto, actualizadas por WebSocket."
      >
        <span className="text-xs text-texto-tenue">
          {conectado ? 'Recibiendo lecturas cada 3 s' : 'Reconectando…'}
        </span>
      </EncabezadoVista>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
        {TIPOS_VARIABLE.map((tipo) => {
          const lectura = lecturas[tipo];
          return (
            <GaugeCircular
              key={tipo}
              variable={tipo}
              valor={lectura?.valor ?? null}
              estado={lectura?.estado ?? 'normal'}
              seleccionado={variable === tipo}
              onClick={() => setVariable(tipo)}
            />
          );
        })}
      </div>

      <div className="tarjeta mt-6">
        <h2 className="text-base font-semibold">{META_VARIABLES[variable].etiqueta}</h2>
        <div className="mt-4">
          {cargando && <p className="py-16 text-center text-sm text-texto-tenue">Cargando serie…</p>}
          {historico && !cargando && (
            <GraficoLinea24h historico={historico} variable={variable} />
          )}
        </div>
      </div>
    </div>
  );
}
