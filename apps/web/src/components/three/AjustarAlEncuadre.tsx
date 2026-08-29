'use client';

import { ReactNode, useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Qué dimensión manda al normalizar.
 *
 * `mayor` sirve para un equipo suelto. Para la planta completa no: su modelo
 * incluye una retícula de terreno de 46 × 46 contra 9 de alto, así que
 * normalizar por la dimensión mayor dejaría los equipos del tamaño de una
 * moneda. Ahí se normaliza por `alto`, que es la medida del equipamiento real.
 */
export type EjeEncuadre = 'mayor' | 'alto' | 'ancho' | 'profundo';

interface Props {
  /** Tamaño que debe ocupar la dimensión elegida, en unidades de escena. */
  tamano: number;
  eje?: EjeEncuadre;
  /**
   * Nombres de nodos que no cuentan para medir.
   *
   * Sirve para la escenografía: la planta trae una retícula de terreno de
   * 46 × 46 que, si se mide, deja el equipamiento reducido a una manchita en el
   * centro. Excluyéndola, el encuadre se ajusta a los equipos, que es lo que el
   * visitante tiene que ver — y la retícula sigue dibujándose, solo que sale de
   * cuadro como debe.
   */
  ignorar?: string[];
  /** Cambiar esta clave vuelve a medir (por ejemplo al pasar del fallback al .glb). */
  clave: string;
  children: ReactNode;
}

/**
 * Caja envolvente saltándose ramas por nombre.
 *
 * `Box3.setFromObject` no permite excluir subárboles, así que el recorrido se
 * hace a mano para poder podar.
 */
function cajaEnvolvente(raiz: THREE.Object3D, ignorar: Set<string>): THREE.Box3 {
  const caja = new THREE.Box3();
  const limite = new THREE.Box3();

  const recorrer = (objeto: THREE.Object3D) => {
    if (objeto.name && ignorar.has(objeto.name)) return;

    const malla = objeto as THREE.Mesh;
    if (malla.isMesh && malla.geometry) {
      malla.updateWorldMatrix(true, false);
      if (!malla.geometry.boundingBox) malla.geometry.computeBoundingBox();
      if (malla.geometry.boundingBox) {
        limite.copy(malla.geometry.boundingBox).applyMatrix4(malla.matrixWorld);
        caja.union(limite);
      }
    }

    for (const hijo of objeto.children) recorrer(hijo);
  };

  recorrer(raiz);
  return caja;
}

function dimension(medidas: THREE.Vector3, eje: EjeEncuadre): number {
  if (eje === 'alto') return medidas.y;
  if (eje === 'ancho') return medidas.x;
  if (eje === 'profundo') return medidas.z;
  return Math.max(medidas.x, medidas.y, medidas.z);
}

/** Mediciones idénticas seguidas antes de dar el encuadre por bueno. */
const FRAMES_ESTABLES = 3;

/**
 * Normaliza cualquier modelo a un tamaño conocido y lo centra en el origen.
 *
 * Es la pieza que hace que los modelos "entren" en su contenedor. Sin esto, cada
 * .glb trae la escala y el origen con que se exportó: uno mide 3 unidades y otro
 * 40, uno está centrado y otro apoyado en una esquina, y la cámara —que está
 * fija— los recorta o los deja diminutos. Midiendo la caja envolvente en tiempo
 * de ejecución, el encuadre deja de depender de cómo se exportó el archivo.
 *
 * La medición se repite hasta estabilizarse en vez de hacerse una sola vez: en
 * el primer frame las mallas ya existen pero sus geometrías todavía no están
 * adjuntas, así que la caja sale parcial. Quedarse con esa primera medida daba
 * un modelo escalado varias veces de más.
 */
const SIN_IGNORADOS: string[] = [];

export function AjustarAlEncuadre({
  tamano,
  eje = 'mayor',
  ignorar = SIN_IGNORADOS,
  clave,
  children,
}: Props) {
  const omitidos = useRef(new Set(ignorar));
  omitidos.current = new Set(ignorar);

  const grupo = useRef<THREE.Group>(null);
  const ajustado = useRef(false);
  const medidaPrevia = useRef(0);
  const estables = useRef(0);

  useLayoutEffect(() => {
    // Contenido nuevo: volver a medir desde cero.
    ajustado.current = false;
    medidaPrevia.current = 0;
    estables.current = 0;
  }, [clave, tamano, eje]);

  useFrame(() => {
    const g = grupo.current;
    if (!g || ajustado.current) return;

    // Se mide con la transformación en neutro; si no, cada medición incluiría
    // el ajuste de la anterior y la escala se iría realimentando.
    g.scale.setScalar(1);
    g.position.set(0, 0, 0);
    g.updateWorldMatrix(true, true);

    const caja = cajaEnvolvente(g, omitidos.current);
    if (caja.isEmpty()) {
      estables.current = 0;
      return;
    }

    const medidas = caja.getSize(new THREE.Vector3());
    const mayor = dimension(medidas, eje);
    if (!Number.isFinite(mayor) || mayor <= 0) {
      estables.current = 0;
      return;
    }

    if (Math.abs(mayor - medidaPrevia.current) > mayor * 0.001) {
      medidaPrevia.current = mayor;
      estables.current = 0;
    } else {
      estables.current += 1;
    }

    // El centro viene en coordenadas de mundo; `position` se expresa en las del
    // padre, así que hay que convertirlo o el modelo se desplaza por el offset
    // que tenga el grupo contenedor.
    const centro = caja.getCenter(new THREE.Vector3());
    if (g.parent) g.parent.worldToLocal(centro);

    const escala = tamano / mayor;
    g.scale.setScalar(escala);
    g.position.set(-centro.x * escala, -centro.y * escala, -centro.z * escala);

    if (estables.current >= FRAMES_ESTABLES) ajustado.current = true;
  });

  return <group ref={grupo}>{children}</group>;
}
