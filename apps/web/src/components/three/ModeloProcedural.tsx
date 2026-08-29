'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { COLOR_ACENTO } from '@renova/shared';

export type FormaModelo = 'tubular' | 'domo' | 'planta';

interface Props {
  forma: FormaModelo;
  statusColor?: string;
  resaltado?: boolean;
}

/**
 * Sustituto procedural mientras el .glb correspondiente no esté en /public/models.
 *
 * No pretende ser el modelo final: es una silueta reconocible del equipo real
 * para que la landing y el dashboard se puedan demostrar completos desde hoy.
 * En cuanto el archivo exista, Model3D deja de renderizar esto sin cambiar código.
 */
export function ModeloProcedural({ forma, statusColor, resaltado }: Props) {
  if (forma === 'planta') return <PlantaProcedural statusColor={statusColor} resaltado={resaltado} />;
  if (forma === 'domo') return <GasometroProcedural statusColor={statusColor} resaltado={resaltado} />;
  return <BiodigestorProcedural statusColor={statusColor} resaltado={resaltado} />;
}

/**
 * Material compartido por las piezas de una misma silueta.
 *
 * El gris-verde base es claro a propósito: sobre el fondo casi negro de la marca,
 * un material oscuro se hunde en el fondo y el modelo se lee como una mancha.
 */
function useMaterial(statusColor?: string, resaltado?: boolean, base = '#7A8A6C') {
  return useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(base),
      roughness: 0.5,
      metalness: 0.12,
    });
    // Tinte moderado: el estado tiene que leerse de un vistazo sin que el equipo
    // deje de parecer un equipo. Con mezcla completa se vuelve una mancha de color.
    if (statusColor) material.color.lerp(new THREE.Color(statusColor), 0.4);
    if (resaltado) {
      material.emissive = new THREE.Color(COLOR_ACENTO);
      material.emissiveIntensity = 0.3;
    } else if (statusColor) {
      material.emissive = new THREE.Color(statusColor);
      material.emissiveIntensity = 0.18;
    }
    return material;
  }, [statusColor, resaltado, base]);
}

/** Biodigestor tubular de geomembrana: cilindro horizontal con tapas y soporte. */
function BiodigestorProcedural({ statusColor, resaltado }: Omit<Props, 'forma'>) {
  const material = useMaterial(statusColor, resaltado);
  const materialSoporte = useMaterial(undefined, false, '#4A5641');

  return (
    <group>
      <mesh material={material} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.75, 2.6, 8, 24]} />
      </mesh>
      {/* Bridas de entrada y salida */}
      <mesh material={materialSoporte} position={[-1.85, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.5, 16]} />
      </mesh>
      <mesh material={materialSoporte} position={[1.85, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.5, 16]} />
      </mesh>
      {/* Cama de apoyo */}
      <mesh material={materialSoporte} position={[0, -0.85, 0]}>
        <boxGeometry args={[3.6, 0.18, 1.5]} />
      </mesh>
    </group>
  );
}

/** Gasómetro: domo sobre base cilíndrica. */
function GasometroProcedural({ statusColor, resaltado }: Omit<Props, 'forma'>) {
  const material = useMaterial(statusColor, resaltado, '#8C9C7C');
  const materialBase = useMaterial(undefined, false, '#4A5641');

  return (
    <group>
      <mesh material={material} position={[0, 0.15, 0]} castShadow>
        <sphereGeometry args={[1.1, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={materialBase} position={[0, -0.2, 0]}>
        <cylinderGeometry args={[1.12, 1.12, 0.7, 32]} />
      </mesh>
      {/* Válvula de alivio en la cúspide */}
      <mesh material={materialBase} position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.4, 12]} />
      </mesh>
    </group>
  );
}

/**
 * Planta completa: recepción, biodigestor, conducción y gasómetro, como se definió
 * mientras no exista planta-biogas.glb.
 *
 * El grupo va corrido en X para que el centro geométrico de la planta caiga en el
 * origen: si no, la rotación idle la haría orbitar en vez de girar sobre sí misma.
 */
function PlantaProcedural({ statusColor, resaltado }: Omit<Props, 'forma'>) {
  const materialTubo = useMaterial(undefined, resaltado, '#96A686');
  const materialLosa = useMaterial(undefined, false, '#333D2B');

  return (
    <group position={[0.8, 0, 0]}>
      <group position={[-2.2, 0, 0]} scale={0.9}>
        <BiodigestorProcedural statusColor={statusColor} resaltado={resaltado} />
      </group>
      <group position={[2.4, 0, 0]}>
        <GasometroProcedural statusColor={statusColor} resaltado={resaltado} />
      </group>

      {/* Conducción de biogás: cilindro delgado entre ambos equipos */}
      <mesh material={materialTubo} position={[0.35, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 3.2, 16]} />
      </mesh>

      {/* Tolva de recepción y triturador, al inicio del flujo */}
      <mesh material={materialLosa} position={[-4.6, -0.35, 0]}>
        <boxGeometry args={[1.1, 0.9, 1.1]} />
      </mesh>
      <mesh material={materialTubo} position={[-4.6, 0.35, 0]}>
        <cylinderGeometry args={[0.45, 0.62, 0.5, 6]} />
      </mesh>

      {/* Losa de la planta */}
      <mesh material={materialLosa} position={[-0.8, -1.02, 0]} receiveShadow>
        <boxGeometry args={[10, 0.12, 3.2]} />
      </mesh>
    </group>
  );
}
