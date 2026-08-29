'use client';

import { EstadoZonaDto, META_VARIABLES, Zona, peorEstado } from '@renova/shared';
import { ChipEstado } from '@/components/ui/ChipEstado';
import { useColoresEstado } from '@/lib/colores';
import { RANGOS_UI } from '@/lib/rangos';

const NOMBRE_ZONA: Record<Zona, string> = {
  biodigestor: 'Biodigestor tubular',
  gasometro: 'Gasómetro',
};

const DESCRIPCION_ZONA: Record<Zona, string> = {
  biodigestor:
    'Reactor anaerobio de geomembrana. Acá se controla que la digestión mesofílica no se salga de régimen.',
  gasometro:
    'Almacenamiento del biogás producido. Acá se mide la calidad del gas y la presión de entrega.',
};

/**
 * Detalle de la zona seleccionada en el modelo 3D.
 *
 * Mientras este panel está abierto, el modelo correspondiente queda fijo (sin
 * rotación idle) para que el operador pueda mirar la zona que está leyendo.
 */
export function PanelDetalleZona({
  zona,
  datos,
  onCerrar,
}: {
  zona: Zona;
  datos: EstadoZonaDto | undefined;
  onCerrar: () => void;
}) {
  const colores = useColoresEstado();
  const variables = datos?.variables ?? [];
  const estado = datos?.estado ?? peorEstado(variables.map((v) => v.estado));

  return (
    <aside className="tarjeta">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{NOMBRE_ZONA[zona]}</h2>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-texto-tenue">
            {DESCRIPCION_ZONA[zona]}
          </p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar detalle"
          className="rounded-lg border border-borde px-2.5 py-1 text-sm text-texto-tenue transition-colors hover:border-acento hover:text-acento"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs text-texto-tenue">Estado de la zona</span>
        <ChipEstado estado={estado} />
      </div>

      <div className="mt-5 space-y-2">
        {variables.length === 0 && (
          <p className="text-sm text-texto-debil">Esperando la primera lectura de la zona…</p>
        )}

        {variables.map((lectura) => {
          const meta = META_VARIABLES[lectura.variable];
          const rango = RANGOS_UI[lectura.variable];
          return (
            <div
              key={lectura.variable}
              className="flex items-center justify-between gap-4 rounded-lg border border-borde bg-superficie-alta px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-texto">{meta.etiqueta}</p>
                <p className="text-[11px] text-texto-debil">
                  Óptimo {rango.optimoMin}–{rango.optimoMax} {meta.unidad}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums text-sm font-medium text-texto">
                  {lectura.valor.toFixed(meta.decimales)} {meta.unidad}
                </span>
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colores[lectura.estado] }}
                />
                <span className="sr-only">Estado: {lectura.estado}</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
