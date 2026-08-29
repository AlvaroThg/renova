# Modelos 3D — colocá los `.glb` acá

Esta carpeta es la **única** desde la que el código carga modelos. Next.js sirve
`/public` como raíz estática, así que un archivo puesto acá queda disponible en
`/models/<archivo>.glb` y se carga con `useGLTF('/models/<archivo>.glb')`.

## Archivos esperados

Los nombres tienen que coincidir **exactamente** (minúsculas, con guiones):

| Archivo | Dónde se usa |
|---|---|
| `planta-biogas.glb` | Hero de la landing y el recorrido de cámara de "La solución" |
| `biodigestor-tubular.glb` | Dashboard — elemento individual, seleccionable por click |
| `gasometro-biogas.glb` | Dashboard — elemento individual, seleccionable por click |

## Qué pasa mientras no estén

Nada se rompe. El componente `Model3D` hace un `HEAD` a la ruta antes de intentar
cargarla; si el archivo no está, dibuja una **silueta procedural** equivalente
(cilindro tubular para el biodigestor, domo para el gasómetro, y la composición de
ambos con su tubo de conexión para la planta completa).

En cuanto copies el `.glb` real acá y recargues, el modelo verdadero reemplaza a la
silueta **sin ningún cambio de código**.

## Recomendaciones de exportación

- Exportar en **glTF Binary (.glb)**: empaqueta geometría, materiales y texturas
  en un solo archivo.
- Aplicar transformaciones y centrar el modelo en el origen antes de exportar; el
  código posiciona los modelos asumiendo que su centro está en `(0, 0, 0)`.
- Escala en metros. La escena está calibrada para un biodigestor de ~3–4 m de largo.
- Materiales PBR estándar: `Model3D` clona los materiales y modula `color` y
  `emissive` para el estado del sensor, así que necesita `MeshStandardMaterial`.
- Si el archivo supera unos pocos MB, pasarlo por `gltf-transform optimize` o
  Draco antes de commitear.

Los `.obj` + `.mtl` de respaldo van en `apps/web/assets/models-source/`, no acá.
