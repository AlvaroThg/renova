# RENOVA — Plataforma de valorización energética

Convertimos residuo orgánico en biogás. Este repositorio contiene los dos módulos
del proyecto:

1. **Sitio de presentación** (`/`) — landing de scroll narrativo con la estructura del
   pitch: problema del gas, solución recorrida en 3D, números, roadmap y capital semilla.
2. **Sistema de gestión y control** (`/dashboard`) — panel operativo del piloto con
   telemetría en vivo, producción, registro de residuos, alertas y generadores.

---

## Arranque rápido

Requisitos: **Node ≥ 20**, **pnpm 10** y **Docker** (para PostgreSQL).

```bash
cp .env.example .env
cp .env.example apps/api/.env

pnpm install
pnpm db:up        # levanta PostgreSQL 16 en Docker
pnpm db:migrate   # crea el esquema
pnpm db:seed      # usuario admin, sensores, generadores e historial de 30 días
pnpm dev          # API en :3001 y web en :3000
```

O todo de una: `pnpm setup && pnpm dev`.

- Landing → http://localhost:3000
- Sistema de gestión → http://localhost:3000/dashboard
- Credenciales de demo → las de `ADMIN_EMAIL` / `ADMIN_PASSWORD` en el `.env`
  (por defecto `admin@renova.bo` / `renova2026`).

Para empezar de cero: `docker compose down -v && pnpm db:up && pnpm db:migrate && pnpm db:seed`.

---

## Modelos 3D

Los tres `.glb` viven en `apps/web/public/models/`, que es la única carpeta desde la
que el código carga modelos:

| Archivo | Uso |
|---|---|
| `planta-biogas.glb` | Hero de la landing y recorrido de cámara de "La solución" |
| `biodigestor-tubular.glb` | Sección "Equipo 01" y dashboard, seleccionable |
| `gasometro-biogas.glb` | Sección "Equipo 02" y dashboard, seleccionable |

Los `.obj` / `.mtl` de edición van en `apps/web/assets/models-source/`, fuera de
`/public`, y el código nunca los importa.

### Encuadre automático

Ningún tamaño ni posición está escrito a mano. `Model3D` mide la caja envolvente
del modelo en tiempo de ejecución y lo normaliza al `tamano` que pide cada vista,
centrado en el origen. Eso significa que **reexportar un `.glb` con otra escala no
rompe nada**.

Dos ajustes finos, por si hace falta tocarlos:

- `ignorarAlEncuadrar` excluye nodos de la medición. La planta trae una retícula de
  terreno de 46 × 46 contra ~9 de alto: si se midiera, los equipos quedarían del
  tamaño de una moneda. Los nombres a excluir están en
  [`nodos-planta.ts`](apps/web/src/components/three/nodos-planta.ts).
- `ejeEncuadre` elige qué dimensión manda (`mayor` por defecto).

### Recorrido de cámara

El recorrido de "La solución" **se ancla a nodos con nombre del propio `.glb`**
(`recepcion_fondo`, `digestor_a_tanque`, `filtro_h2s`, `gasometro_domo_flexible`…),
no a coordenadas fijas. Si el modelo cambia de escala o distribución, la cámara
sigue apuntando al equipo correcto. Los nombres están en
[`CamaraRecorrido.tsx`](apps/web/src/components/three/CamaraRecorrido.tsx).

### Si falta un archivo

`Model3D` consulta con un `HEAD` si el `.glb` existe y, si no, dibuja una silueta
procedural equivalente, de modo que la plataforma funciona igual. Un `.glb` corrupto
lo cubre un `ErrorBoundary` con el mismo respaldo.

---

## Modo claro y oscuro

El tema se elige con el botón de la barra superior (y en la barra lateral del
dashboard), se guarda por navegador y arranca respetando la preferencia del sistema.
Un script inline lo fija antes del primer pintado para que no haya destello blanco.

Los colores viven como variables CSS en
[`globals.css`](apps/web/src/app/globals.css) y Tailwind los compone; no hay clases
duplicadas por tema.

**Los dos temas tienen paletas medidas por separado, no una invertida:**

| Rol | Oscuro | Claro |
|---|---|---|
| Serie de datos | `#D4F84A` (lima de marca) | `#2A6E9E` (azul) |
| Normal | `#4ADE80` | `#17924F` |
| Alerta | `#E8842A` | `#D07A16` |
| Crítico | `#E3344E` | `#A3182F` |

El lima de marca no puede ser el color de dato en claro: tiene 1,17:1 de contraste
sobre blanco, y su versión oscura (oliva) es indistinguible del naranja de alerta en
deuteranopía. Por eso la serie clara cambia de familia. Verde↔rojo sigue siendo
confundible en ambos temas —inevitable en un semáforo—, así que **ningún estado se
muestra solo con color**: siempre lleva ícono y etiqueta.

---

## Estructura

```
apps/api/          NestJS — arquitectura hexagonal
  domain/          entidades y reglas puras, sin framework
  application/     casos de uso
  infrastructure/  Prisma, simulador de sensores, WebSocket, auth
  interface/       controllers REST y gateway WebSocket
apps/web/          Next.js 15 (App Router)
  app/(presentacion)/  landing pública
  app/(dashboard)/     sistema de gestión, con su layout y guard
  components/three/    Model3D y escenas reutilizables
  lib/api/             cliente tipado + WebSocket
packages/shared/   contratos compartidos entre front y back
```

### Por qué hexagonal

El dominio (`apps/api/src/domain/`) no importa nada de NestJS ni de Prisma. Los casos
de uso hablan con **puertos** (interfaces) y `InfrastructureModule` es el único archivo
que decide qué adaptador concreto los satisface.

Consecuencia práctica: hoy las lecturas vienen de `SimuladorSensoresAdapter`. Cuando
llegue el ESP32/PLC, se escribe un `HardwareSensorAdapter` con la misma interfaz y se
cambia **una línea**:

```ts
{ provide: SENSOR_CLIENT, useClass: SimuladorSensoresAdapter },
```

Ni el dominio ni los casos de uso se enteran.

---

## El simulador

Mientras no haya hardware, un scheduler muestrea cada 3 s y alimenta el caso de uso
`RegistrarLectura`. No es ruido blanco: cada variable hace un random walk con reversión
a su setpoint, acotado al rango físico de la variable, y cada tanto se fuerza una
excursión fuera de rango para que la demo genere alertas reales.

Se apaga con `SIMULADOR_ACTIVO=false` en el `.env` — útil el día que el hardware
empiece a hacer push.

## Rangos operativos

Los umbrales de digestión mesofílica viven en un solo lugar,
[`apps/api/src/domain/lectura/rango-operativo.ts`](apps/api/src/domain/lectura/rango-operativo.ts):

| Variable | Óptimo | Alerta | Crítico |
|---|---|---|---|
| Temperatura | 33–37 °C | 30–33 / 37–40 | fuera de 30–40 |
| pH | 6,8–7,2 | 6,5–6,8 / 7,2–7,5 | fuera de 6,5–7,5 |
| Presión | 0,02–0,05 bar | hasta 0,07 | > 0,07 |
| Humedad | 60–70 % | 55–60 / 70–75 | fuera de 55–75 |
| CH₄ | 55–70 % | 50–55 | < 50 |
| CO₂ | 25–40 % | 40–45 | > 45 |
| H₂S | < 200 ppm | 200–500 | > 500 |

Cambiar un umbral acá cambia el color del modelo 3D, la severidad de la alerta y la
banda del gráfico. No hay que tocar nada más.

## Modelo económico

También centralizado, en `packages/shared/src/constantes.ts`:

2.000 kg/día de residuo × 0,175 m³/kg = **350 m³ de biogás/día** × Bs 2/m³ × 30 días =
**Bs 21.000/mes**. La interfaz nunca multiplica factores por su cuenta.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | API y web en paralelo |
| `pnpm build` | compila shared, API y web |
| `pnpm test` | tests unitarios de dominio y simulador |
| `pnpm db:up` / `db:down` | PostgreSQL en Docker |
| `pnpm db:migrate` / `db:seed` / `db:studio` | esquema, datos y explorador Prisma |

## API

Todo bajo JWT salvo `POST /auth/login`.

```
POST   /auth/login
GET    /telemetria/resumen | /telemetria/estado | /telemetria/historico?variable=&horas=
GET    /produccion?rango=dia|semana|mes
GET    /alertas            POST /alertas/:id/reconocer
GET    /residuos           POST /residuos
GET    /generadores        POST /generadores   PATCH /generadores/:id   DELETE /generadores/:id
WS     /telemetria         eventos: lectura:nueva · alerta:nueva · estado:zonas
```

---

## Pendientes conocidos

- Los **datos de la caída de gas** de la sección "El problema" son la proyección usada
  en el pitch, no una serie oficial descargada de YPFB. Están marcados como tal en la
  propia landing y hay que reemplazarlos por la serie exacta antes de publicar
  (`apps/web/src/components/graficos/GraficoCaidaGas.tsx`).
- El registro de residuos es manual; el puerto ya contempla `origen: 'bascula'` para
  cuando se integre el pesaje automático.
- La autenticación es un único operador creado por el seed. Si el piloto necesita
  varios usuarios con roles, el puerto `UsuarioRepository` es el punto de extensión.
