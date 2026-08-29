'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api/client';
import { useConsulta } from '@/lib/api/useConsulta';
import { EncabezadoVista } from '@/components/dashboard/BarraLateral';

export default function VistaResiduos() {
  const { datos: generadores } = useConsulta(() => api.generadores(), []);
  const { datos: entregas, recargar } = useConsulta(() => api.residuos(), []);

  const [generadorId, setGeneradorId] = useState('');
  const [cantidadKg, setCantidadKg] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function registrar(evento: FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setMensaje(null);
    try {
      await api.registrarResiduo({
        generadorId,
        cantidadKg: Number(cantidadKg),
        observaciones: observaciones || null,
      });
      setMensaje({ tipo: 'ok', texto: 'Entrega registrada.' });
      setCantidadKg('');
      setObservaciones('');
      recargar();
    } catch (e) {
      setMensaje({ tipo: 'error', texto: (e as Error).message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="p-8">
      <EncabezadoVista
        titulo="Residuos procesados"
        descripcion="Registro de entregas por generador. La carga es manual hasta que se integre la báscula."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={registrar} className="tarjeta h-fit">
          <h2 className="text-base font-semibold">Registrar entrega</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="generador" className="mb-1.5 block text-sm text-texto-tenue">
                Generador
              </label>
              <select
                id="generador"
                required
                value={generadorId}
                onChange={(e) => setGeneradorId(e.target.value)}
                className="campo"
              >
                <option value="">Seleccioná un generador…</option>
                {(generadores ?? [])
                  .filter((g) => g.activo)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="cantidad" className="mb-1.5 block text-sm text-texto-tenue">
                Cantidad (kg)
              </label>
              <input
                id="cantidad"
                type="number"
                min="0.1"
                max="10000"
                step="0.1"
                required
                value={cantidadKg}
                onChange={(e) => setCantidadKg(e.target.value)}
                className="campo tabular-nums"
                placeholder="1200"
              />
            </div>

            <div>
              <label htmlFor="observaciones" className="mb-1.5 block text-sm text-texto-tenue">
                Observaciones <span className="text-texto-debil">(opcional)</span>
              </label>
              <textarea
                id="observaciones"
                rows={3}
                maxLength={280}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="campo resize-none"
                placeholder="Alta proporción de cáscara de cítrico…"
              />
            </div>

            {mensaje && (
              <p
                role="status"
                className={`rounded-lg border px-3 py-2 text-sm ${
                  mensaje.tipo === 'ok'
                    ? 'border-estado-normal/40 bg-estado-normal/10'
                    : 'border-estado-critico/40 bg-estado-critico/10'
                }`}
              >
                {mensaje.texto}
              </p>
            )}

            <button type="submit" disabled={enviando} className="boton-primario w-full disabled:opacity-60">
              {enviando ? 'Registrando…' : 'Registrar entrega'}
            </button>
          </div>
        </form>

        <div className="tarjeta overflow-hidden p-0">
          <h2 className="border-b border-borde px-5 py-4 text-base font-semibold">
            Últimas entregas
          </h2>

          <div className="max-h-[560px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-superficie-alta text-xs text-texto-tenue">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Fecha</th>
                  <th className="px-5 py-2.5 font-medium">Generador</th>
                  <th className="px-5 py-2.5 text-right font-medium">Cantidad</th>
                  <th className="px-5 py-2.5 font-medium">Origen</th>
                </tr>
              </thead>
              <tbody>
                {(entregas ?? []).map((entrega) => (
                  <tr key={entrega.id} className="border-t border-borde/60">
                    <td className="px-5 py-2.5 tabular-nums text-texto-tenue">
                      {new Date(entrega.fecha).toLocaleDateString('es-BO')}
                    </td>
                    <td className="px-5 py-2.5">{entrega.generadorNombre}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">
                      {entrega.cantidadKg.toLocaleString('es-BO')} kg
                    </td>
                    <td className="px-5 py-2.5 text-xs text-texto-debil">{entrega.origen}</td>
                  </tr>
                ))}
                {entregas?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-texto-debil">
                      Todavía no hay entregas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
