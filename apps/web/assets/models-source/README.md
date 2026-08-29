# Modelos fuente (`.obj` + `.mtl`) — solo respaldo

Acá van los archivos de **edición y referencia** de los modelos 3D:

- `planta-biogas.obj` + `planta-biogas.mtl`
- `biodigestor-tubular.obj` + `biodigestor-tubular.mtl`
- `gasometro-biogas.obj` + `gasometro-biogas.mtl`

## Importante

**El código no importa nada de esta carpeta.** Está fuera de `/public` y fuera del
árbol de módulos, así que su contenido nunca entra al bundle ni se sirve al
navegador. Existe únicamente para que el equipo tenga la fuente editable cerca del
proyecto.

Lo que la aplicación carga son los `.glb` de `apps/web/public/models/`. Después de
editar un `.obj` acá, hay que **volver a exportar el `.glb`** a esa otra carpeta
para que el cambio se vea.

Estos archivos sí se versionan: pesan pocos MB y son la única fuente editable de
los modelos.
