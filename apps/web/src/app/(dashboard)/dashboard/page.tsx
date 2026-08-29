'use client';

import { useMemo, useState } from 'react';
import {
  BIOGAS_BASE_M3_DIA,
  EstadoSensor,
  Zona,
  peorEstado,
} from '@renova/shared';
import { api } from '@/lib/api/client';
import { useConsulta } from '@/lib/api/useConsulta';
import { useTelemetriaCompartida } from '@/lib/api/ProveedorTelemetria';
import { bolivianos, kilos, metrosCubicos } from '@/lib/formato';
import { EncabezadoVista } from '@/components/dashboard/BarraLateral';
import { EscenaZonas } from '@/components/dashboard/EscenaZonas';
import { PanelDetalleZona } from '@/components/dashboard/PanelDetalleZona';
import { ChipEstado } from '@/components/ui/ChipEstado';

export default function VistaGeneral() {
  const { zonas, ultimaAlerta } = useTelemetriaCompartida();
  const { datos: resumen } = useConsulta(() => api.resumen(), []);
  const [zonaSeleccionada, setZonaSeleccionada] = useState<Zona | null>(null);

  // El WebSocket manda; el resumen REST solo cubre el arranque hasta el primer evento.
  const zonasVigentes = zonas.length > 0 ? zonas : (resumen?.zonas ?? []);

  const estadoPorZona = useMemo<Record<Zona, EstadoSensor>>(() => {
    const mapa: Record<Zona, EstadoSensor> = { biodigestor: 'normal', gasometro: 'normal' };
    for (const zona of zonasVigentes) mapa[zona.zona] = zona.estado;
    return mapa;
  }, [zonasVigentes]);

  const estadoPlanta = peorEstado(Object.values(estadoPorZona));

  return (
    <div className="p-8">
      <EncabezadoVista
        titulo="Vista general"
        descripcion="Estado del piloto en tiempo real. Hacé click en un equipo para ver su detalle."
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-texto-tenue">Estado de la planta</span>
          <ChipEstado estado={estadoPlanta} />
        </div>
      </EncabezadoVista>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tarjeta
          etiqueta="Biogás hoy"
          valor={resumen ? metrosCubicos(resumen.biogasHoyM3) : '—'}
          nota={`Base ${BIOGAS_BASE_M3_DIA} m³/día`}
        />
        <Tarjeta
          etiqueta="Residuo procesado hoy"
          valor={resumen ? kilos(resumen.residuoHoyKg) : '—'}
          nota="Suma de entregas del día"
        />
        <Tarjeta
          etiqueta="Ingreso del mes"
          valor={resumen ? bolivianos(resumen.ingresoMesBs) : '—'}
          nota="Últimos 30 días"
        />
        <Tarjeta
          etiqueta="Alertas sin reconocer"
          valor={resumen ? String(resumen.alertasActivas) : '—'}
          nota={ultimaAlerta ? ultimaAlerta.mensaje : 'Sin alertas nuevas en esta sesión'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <EscenaZonas
            estadoPorZona={estadoPorZona}
            zonaSeleccionada={zonaSeleccionada}
            onSeleccionar={(zona) =>
              setZonaSeleccionada((actual) => (actual === zona ? null : zona))
            }
          />
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-texto-tenue">
            <LeyendaZona nombre="Biodigestor" estado={estadoPorZona.biodigestor} />
            <LeyendaZona nombre="Gasómetro" estado={estadoPorZona.gasometro} />
          </div>
        </div>

        {zonaSeleccionada ? (
          <PanelDetalleZona
            zona={zonaSeleccionada}
            datos={zonasVigentes.find((z) => z.zona === zonaSeleccionada)}
            onCerrar={() => setZonaSeleccionada(null)}
          />
        ) : (
          <div className="tarjeta flex flex-col justify-center text-center">
            <p className="text-sm text-texto-tenue">
              Seleccioná el biodigestor o el gasómetro en la escena para ver sus variables.
            </p>
            <p className="mt-2 text-xs text-texto-debil">
              El equipo seleccionado deja de rotar mientras leés su detalle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Tarjeta({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota: string }) {
  return (
    <div className="tarjeta">
      <p className="text-xs text-texto-tenue">{etiqueta}</p>
      <p className="mt-2 text-2xl font-semibold text-texto">{valor}</p>
      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-texto-debil">{nota}</p>
    </div>
  );
}

function LeyendaZona({ nombre, estado }: { nombre: string; estado: EstadoSensor }) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-texto">{nombre}</span>
      <ChipEstado estado={estado} compacto />
    </span>
  );
}
