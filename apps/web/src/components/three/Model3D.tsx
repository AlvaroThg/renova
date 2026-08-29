'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { COLOR_ACENTO } from '@renova/shared';
import { FormaModelo, ModeloProcedural } from './ModeloProcedural';
import { useModeloDisponible } from './useModeloDisponible';
import { LimiteDeError } from './LimiteDeError';
import { AjustarAlEncuadre, type EjeEncuadre } from './AjustarAlEncuadre';

export interface Model3DProps {
  /** Ruta del .glb dentro de /public. */
  modelPath: string;
  /** Silueta procedural a usar si el archivo todavía no está en el proyecto. */
  fallbackShape: FormaModelo;
  /**
   * Tamaño al que se normaliza el modelo, en unidades de escena. Es lo que hace
   * que el encuadre no dependa de cómo se exportó el .glb.
   */
  tamano?: number;
  /** Qué dimensión manda al normalizar. Ver EjeEncuadre. */
  ejeEncuadre?: EjeEncuadre;
  /** Nodos que no cuentan para medir el encuadre (terreno, retículas, halos). */
  ignorarAlEncuadrar?: string[];
  /** Rotación continua sobre Y cuando nadie interactúa. */
  autoRotate?: boolean;
  /** Velocidad de la rotación idle, en rad/s. */
  rotationSpeed?: number;
  /** Acercamiento y escalado suave al pasar el cursor. */
  hoverZoom?: boolean;
  hoverScale?: number;
  /** Habilita el click. Se usa en el dashboard; en la landing los modelos son narrativos. */
  interactive?: boolean;
  onSelect?: () => void;
  /** Congela la rotación mientras el panel de detalle de este modelo está abierto. */
  pinned?: boolean;
  /** Color de estado del sensor asociado (verde / naranja / rojo), en vivo por WebSocket. */
  statusColor?: string;
  posicion?: [number, number, number];
  rotacionInicial?: [number, number, number];
}

/**
 * Componente 3D reutilizable de RENOVA.
 *
 * Funciona igual con cualquiera de los tres modelos: solo cambia `modelPath`.
 * Todo el comportamiento (idle, hover, click, color de estado, encuadre) vive
 * acá, así que landing y dashboard comparten la misma implementación.
 */
export function Model3D({
  modelPath,
  fallbackShape,
  tamano = 4,
  ejeEncuadre = 'mayor',
  ignorarAlEncuadrar,
  autoRotate = true,
  rotationSpeed = 0.15,
  hoverZoom = true,
  hoverScale = 1.15,
  interactive = false,
  onSelect,
  pinned = false,
  statusColor,
  posicion = [0, 0, 0],
  rotacionInicial = [0, 0, 0],
}: Model3DProps) {
  const grupo = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const disponibilidad = useModeloDisponible(modelPath);

  const acercado = hover && hoverZoom;
  const usaGlb = disponibilidad === 'disponible';

  useFrame((_estado, delta) => {
    const g = grupo.current;
    if (!g) return;

    // La rotación idle cede ante cualquier interacción: hover o panel abierto.
    if (autoRotate && !hover && !pinned) {
      g.rotation.y += rotationSpeed * delta;
    }

    // Suavizado exponencial independiente del framerate — nunca un salto brusco.
    const escalaObjetivo = acercado ? hoverScale : 1;
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, escalaObjetivo, 6, delta));

    const zObjetivo = posicion[2] + (acercado ? tamano * 0.12 : 0);
    g.position.z = THREE.MathUtils.damp(g.position.z, zObjetivo, 6, delta);
  });

  useEffect(() => {
    if (!interactive) return;
    document.body.style.cursor = hover ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hover, interactive]);

  const respaldo = (
    <ModeloProcedural forma={fallbackShape} statusColor={statusColor} resaltado={acercado} />
  );

  return (
    <group
      ref={grupo}
      position={posicion}
      rotation={rotacionInicial}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHover(false);
      }}
      onClick={
        interactive
          ? (e) => {
              e.stopPropagation();
              onSelect?.();
            }
          : undefined
      }
    >
      <AjustarAlEncuadre
        tamano={tamano}
        eje={ejeEncuadre}
        ignorar={ignorarAlEncuadrar}
        clave={`${modelPath}|${disponibilidad}`}
      >
        {usaGlb ? (
          <LimiteDeError respaldo={respaldo}>
            <Suspense fallback={<SiluetaCargando tamano={tamano} />}>
              <ModeloGLB ruta={modelPath} statusColor={statusColor} resaltado={acercado} />
            </Suspense>
          </LimiteDeError>
        ) : (
          respaldo
        )}
      </AjustarAlEncuadre>
    </group>
  );
}

/**
 * Carga el .glb y le aplica el color de estado.
 *
 * useGLTF cachea la escena y la comparte entre todas las instancias del mismo
 * archivo, así que hay que clonar geometría Y materiales: sin eso, teñir de rojo
 * un biodigestor teñiría también al otro que use el mismo modelo.
 */
function ModeloGLB({
  ruta,
  statusColor,
  resaltado,
}: {
  ruta: string;
  statusColor?: string;
  resaltado?: boolean;
}) {
  const { scene } = useGLTF(ruta);

  const clon = useMemo(() => {
    const copia = scene.clone(true);
    copia.traverse((objeto) => {
      const malla = objeto as THREE.Mesh;
      if (!malla.isMesh) return;
      const materiales = Array.isArray(malla.material) ? malla.material : [malla.material];
      const propios = materiales.map((material) => {
        const propio = material.clone() as THREE.MeshStandardMaterial;
        // Se guarda el color original: el estado tiñe sobre él, no lo reemplaza,
        // para no perder el aspecto del material exportado desde el modelador.
        if (propio.color) propio.userData.colorOriginal = propio.color.clone();
        return propio;
      });
      malla.material = propios.length === 1 ? propios[0] : propios;
    });
    return copia;
  }, [scene]);

  useEffect(() => {
    clon.traverse((objeto) => {
      const malla = objeto as THREE.Mesh;
      if (!malla.isMesh) return;
      const materiales = Array.isArray(malla.material) ? malla.material : [malla.material];
      for (const material of materiales) {
        const std = material as THREE.MeshStandardMaterial;
        const original = std.userData?.colorOriginal as THREE.Color | undefined;

        if (std.color && original) {
          std.color.copy(original);
          if (statusColor) std.color.lerp(new THREE.Color(statusColor), 0.4);
        }

        if (!std.emissive) continue;
        if (resaltado) {
          std.emissive.set(COLOR_ACENTO);
          std.emissiveIntensity = 0.35;
        } else if (statusColor) {
          std.emissive.set(statusColor);
          std.emissiveIntensity = 0.2;
        } else {
          std.emissive.set('#000000');
          std.emissiveIntensity = 0;
        }
      }
    });
  }, [clon, statusColor, resaltado]);

  return <primitive object={clon} />;
}

/** Silueta wireframe en color acento mientras el .glb (que puede pesar varios MB) llega. */
function SiluetaCargando({ tamano }: { tamano: number }) {
  const malla = useRef<THREE.Mesh>(null);
  useFrame((_e, delta) => {
    if (malla.current) malla.current.rotation.y += delta * 0.6;
  });
  return (
    <mesh ref={malla}>
      <icosahedronGeometry args={[tamano * 0.35, 1]} />
      <meshBasicMaterial color={COLOR_ACENTO} wireframe transparent opacity={0.35} />
    </mesh>
  );
}
