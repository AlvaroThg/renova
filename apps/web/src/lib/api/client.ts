import type {
  ActualizarGeneradorDto,
  AlertaDto,
  AuthResponseDto,
  CrearGeneradorDto,
  EntregaResiduoDto,
  EstadoZonaDto,
  HistoricoDto,
  LoginDto,
  ProduccionDto,
  RangoProduccion,
  RegistrarEntregaDto,
  ResumenDto,
  TipoVariable,
  GeneradorDto,
} from '@renova/shared';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const CLAVE_TOKEN = 'renova.token';
const CLAVE_USUARIO = 'renova.usuario';

export class ErrorApi extends Error {
  constructor(
    readonly estado: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

export function leerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(CLAVE_TOKEN);
}

export function guardarSesion(auth: AuthResponseDto): void {
  window.localStorage.setItem(CLAVE_TOKEN, auth.accessToken);
  window.localStorage.setItem(CLAVE_USUARIO, JSON.stringify(auth.usuario));
}

export function leerUsuario(): AuthResponseDto['usuario'] | null {
  if (typeof window === 'undefined') return null;
  const crudo = window.localStorage.getItem(CLAVE_USUARIO);
  return crudo ? (JSON.parse(crudo) as AuthResponseDto['usuario']) : null;
}

export function cerrarSesion(): void {
  window.localStorage.removeItem(CLAVE_TOKEN);
  window.localStorage.removeItem(CLAVE_USUARIO);
}

/** Fetch tipado con el JWT adjunto. Un 401 limpia la sesión: el token venció. */
async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = leerToken();
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  });

  if (respuesta.status === 401) {
    cerrarSesion();
    throw new ErrorApi(401, 'La sesión expiró. Volvé a iniciar sesión.');
  }

  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => ({}));
    const mensaje = (cuerpo as { message?: string | string[] }).message;
    throw new ErrorApi(
      respuesta.status,
      Array.isArray(mensaje) ? mensaje.join(', ') : (mensaje ?? 'Error de comunicación con la API'),
    );
  }

  if (respuesta.status === 204) return undefined as T;
  return (await respuesta.json()) as T;
}

/** Superficie completa de la API, tipada con los contratos de @renova/shared. */
export const api = {
  login: (datos: LoginDto) =>
    pedir<AuthResponseDto>('/auth/login', { method: 'POST', body: JSON.stringify(datos) }),

  resumen: () => pedir<ResumenDto>('/telemetria/resumen'),
  estado: () => pedir<EstadoZonaDto[]>('/telemetria/estado'),
  historico: (variable: TipoVariable, horas = 24) =>
    pedir<HistoricoDto>(`/telemetria/historico?variable=${variable}&horas=${horas}`),

  produccion: (rango: RangoProduccion) => pedir<ProduccionDto>(`/produccion?rango=${rango}`),

  alertas: () => pedir<AlertaDto[]>('/alertas'),
  reconocerAlerta: (id: string) =>
    pedir<void>(`/alertas/${id}/reconocer`, { method: 'POST' }),

  residuos: () => pedir<EntregaResiduoDto[]>('/residuos'),
  registrarResiduo: (datos: RegistrarEntregaDto) =>
    pedir<{ ok: true }>('/residuos', { method: 'POST', body: JSON.stringify(datos) }),

  generadores: () => pedir<GeneradorDto[]>('/generadores'),
  crearGenerador: (datos: CrearGeneradorDto) =>
    pedir<GeneradorDto>('/generadores', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarGenerador: (id: string, cambios: ActualizarGeneradorDto) =>
    pedir<GeneradorDto>(`/generadores/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) }),
  eliminarGenerador: (id: string) => pedir<void>(`/generadores/${id}`, { method: 'DELETE' }),
};
