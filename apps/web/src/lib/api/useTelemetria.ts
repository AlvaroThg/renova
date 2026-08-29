'use client';

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  AlertaDto,
  EstadoZonaDto,
  LecturaDto,
  TipoVariable,
  WS_EVENTS,
  WS_NAMESPACE,
} from '@renova/shared';
import { API_URL, leerToken } from './client';

export interface EstadoTelemetria {
  /** Última lectura de cada variable, indexada para acceso directo por el gauge. */
  lecturas: Record<string, LecturaDto>;
  zonas: EstadoZonaDto[];
  ultimaAlerta: AlertaDto | null;
  conectado: boolean;
}

/**
 * Suscripción en vivo a la telemetría del piloto.
 *
 * El token viaja en el handshake, no en la URL: el gateway rechaza la conexión
 * si no es válido, igual que hace el guard en las rutas REST.
 */
export function useTelemetria(): EstadoTelemetria {
  const [lecturas, setLecturas] = useState<Record<string, LecturaDto>>({});
  const [zonas, setZonas] = useState<EstadoZonaDto[]>([]);
  const [ultimaAlerta, setUltimaAlerta] = useState<AlertaDto | null>(null);
  const [conectado, setConectado] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = leerToken();
    if (!token) return;

    const socket = io(`${API_URL}${WS_NAMESPACE}`, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => setConectado(true));
    socket.on('disconnect', () => setConectado(false));

    socket.on(WS_EVENTS.lecturaNueva, (lectura: LecturaDto) => {
      setLecturas((previas) => ({ ...previas, [lectura.variable]: lectura }));
    });

    socket.on(WS_EVENTS.estadoZonas, (nuevas: EstadoZonaDto[]) => {
      setZonas(nuevas);
      // El estado por zonas trae la última lectura de cada variable: sirve para
      // pintar los gauges al conectar, antes del primer evento individual.
      setLecturas((previas) => {
        const combinadas = { ...previas };
        for (const zona of nuevas) {
          for (const lectura of zona.variables) combinadas[lectura.variable] = lectura;
        }
        return combinadas;
      });
    });

    socket.on(WS_EVENTS.alertaNueva, (alerta: AlertaDto) => setUltimaAlerta(alerta));

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  return { lecturas, zonas, ultimaAlerta, conectado };
}

/** Atajo tipado para leer una variable concreta del estado en vivo. */
export function lecturaDe(
  estado: EstadoTelemetria,
  variable: TipoVariable,
): LecturaDto | undefined {
  return estado.lecturas[variable];
}
