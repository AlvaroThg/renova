'use client';

import { useEffect } from 'react';
import { META_VARIABLES } from '@renova/shared';
import { api } from '@/lib/api/client';
import { useConsulta } from '@/lib/api/useConsulta';
import { useTelemetriaCompartida } from '@/lib/api/ProveedorTelemetria';
import { EncabezadoVista } from '@/components/dashboard/BarraLateral';
import { ChipEstado } from '@/components/ui/ChipEstado';
import { useColoresEstado } from '@/lib/colores';

export default function VistaAlertas() {
  const { ultimaAlerta } = useTelemetriaCompartida();
  const colores = useColoresEstado();
  const { datos: alertas, recargar } = useConsulta(() => api.alertas(), []);

  // Una alerta nueva por WebSocket refresca la tabla: el historial es la fuente
  // ordenada, el evento en vivo solo avisa que hay algo nuevo que traer.
  useEffect(() => {
    if (ultimaAlerta) recargar();
  }, [ultimaAlerta, recargar]);

  async function reconocer(id: string) {
    await api.reconocerAlerta(id);
    recargar();
  }

  return (
    <div className="p-8">
      <EncabezadoVista
        titulo="Historial de alertas"
        descripcion="Cada vez que una variable sale de su rango operativo queda registrada acá."
      />

      <div className="tarjeta overflow-hidden p-0">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-superficie-alta text-xs text-texto-tenue">
              <tr>
                <th className="px-5 py-3 font-medium">Fecha y hora</th>
                <th className="px-5 py-3 font-medium">Variable</th>
                <th className="px-5 py-3 text-right font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Severidad</th>
                <th className="px-5 py-3 font-medium">Mensaje</th>
                <th className="px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(alertas ?? []).map((alerta) => {
                const meta = META_VARIABLES[alerta.variable];
                return (
                  <tr key={alerta.id} className="border-t border-borde/60 align-top">
                    <td className="whitespace-nowrap px-5 py-3 tabular-nums text-texto-tenue">
                      {new Date(alerta.timestamp).toLocaleString('es-BO', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: colores[alerta.severidad] }}
                        />
                        {meta.etiqueta}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums">
                      {alerta.valor} {alerta.unidad}
                    </td>
                    <td className="px-5 py-3">
                      <ChipEstado estado={alerta.severidad} compacto />
                    </td>
                    <td className="px-5 py-3 text-texto-tenue">{alerta.mensaje}</td>
                    <td className="px-5 py-3">
                      {alerta.reconocida ? (
                        <span className="text-xs text-texto-debil">Reconocida</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => reconocer(alerta.id)}
                          className="text-xs text-acento underline decoration-borde underline-offset-4"
                        >
                          Reconocer
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {alertas?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-texto-debil">
                    Sin alertas registradas. La planta viene operando en rango.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
