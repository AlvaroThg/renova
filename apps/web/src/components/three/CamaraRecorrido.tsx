'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useProgresoScroll } from './progreso-scroll';

/**
 * Una etapa del recorrido narrativo.
 *
 * `anclas` son nombres de nodos dentro del .glb: la cámara se apunta a la caja
 * real de esos objetos, no a coordenadas escritas a mano. Es lo que permite que
 * el recorrido siga funcionando si el modelo se reexporta con otra escala u otra
 * distribución — y lo que evita tener que recalibrar números mágicos.
 *
 * `respaldo` es la posición relativa (−0,5 a 0,5 del ancho) que se usa cuando
 * ninguno de esos nodos existe, por ejemplo con la silueta procedural.
 */
export interface EtapaRecorrido {
  anclas: string[];
  respaldo: number;
}

export const ETAPAS_PLANTA: EtapaRecorrido[] = [
  { anclas: ['recepcion_fondo', 'triturador_tolva', 'banda_transportadora'], respaldo: -0.38 },
  { anclas: ['digestor_a_tanque', 'digestor_b_tanque', 'tanque_mezcla'], respaldo: -0.08 },
  { anclas: ['filtro_h2s', 'trampa_condensados', 'medidor_caudal'], respaldo: 0.14 },
  { anclas: ['gasometro_domo_flexible', 'gasometro_base', 'generador_alternador'], respaldo: 0.36 },
];

/** El objetivo se corre a la izquierda del equipo para que quede encuadrado a la derecha. */
const DESPLAZAMIENTO_TEXTO = 0.85;
/** Distancia de cámara como múltiplo del tamaño del equipo enfocado. */
const DISTANCIA = 2.4;
const ALTURA = 0.7;
/** Frames durante los que se reintenta ubicar las etapas (~1,5 s a 60 fps). */
const FRAMES_RESOLUCION = 90;

interface Props {
  /** Debe coincidir con el `tamano` que se le pasó al Model3D de la planta. */
  tamano: number;
  etapas?: EtapaRecorrido[];
}

interface Encuadre {
  centro: THREE.Vector3;
  radio: number;
}

/**
 * Mueve la cámara según el progreso de scroll.
 *
 * No salta a la posición exacta: amortigua hacia ella, de modo que un scroll
 * brusco se traduce igual en un movimiento de cámara continuo.
 */
export function CamaraRecorrido({ tamano, etapas = ETAPAS_PLANTA }: Props) {
  const progreso = useProgresoScroll();
  const escena = useThree((estado) => estado.scene);

  const encuadres = useRef<Encuadre[] | null>(null);
  const framesResolviendo = useRef(0);
  const objetivoActual = useRef(new THREE.Vector3());
  const iniciado = useRef(false);

  useFrame(({ camera }, delta) => {
    // Se vuelve a resolver durante el primer segundo y medio en vez de una sola
    // vez: el .glb llega por Suspense y el ajuste de encuadre sigue moviendo el
    // modelo unos frames más. Cachear la primera lectura dejaría la cámara
    // apuntando a donde el modelo estaba, no a donde quedó.
    if (framesResolviendo.current < FRAMES_RESOLUCION) {
      framesResolviendo.current += 1;
      const { encuadres: resueltos, algunoReal } = resolverEncuadres(escena, etapas, tamano);
      encuadres.current = resueltos;
      // En cuanto los nodos reales aparecen y se estabilizan, se deja de buscar.
      if (algunoReal && framesResolviendo.current > 20) {
        framesResolviendo.current = FRAMES_RESOLUCION;
      }
    }
    if (!encuadres.current) return;

    const lista = encuadres.current;
    const t = THREE.MathUtils.clamp(progreso.current, 0, 1);
    // Mismo reparto que los bloques de texto de la sección: la etapa i está
    // centrada en (i + 0,5)/n, de modo que la cámara llega a su parada justo
    // cuando el texto correspondiente termina de aparecer.
    const tramo = THREE.MathUtils.clamp(t * lista.length - 0.5, 0, lista.length - 1);
    const indice = Math.min(Math.floor(tramo), lista.length - 2);
    const fraccion = tramo - indice;

    const desde = lista[indice];
    const hasta = lista[indice + 1];

    const centro = desde.centro.clone().lerp(hasta.centro, fraccion);
    const radio = THREE.MathUtils.lerp(desde.radio, hasta.radio, fraccion);

    const objetivo = centro.clone();
    objetivo.x -= radio * DESPLAZAMIENTO_TEXTO;

    const posicion = objetivo.clone();
    posicion.y += radio * ALTURA;
    posicion.z += radio * DISTANCIA;

    // El primer frame se coloca sin amortiguar: si no, la cámara entra volando
    // desde su posición inicial cada vez que se vuelve a la sección.
    if (!iniciado.current) {
      camera.position.copy(posicion);
      objetivoActual.current.copy(objetivo);
      iniciado.current = true;
    }

    amortiguar(camera.position, posicion, delta);
    amortiguar(objetivoActual.current, objetivo, delta);
    camera.lookAt(objetivoActual.current);
  });

  return null;
}

function amortiguar(actual: THREE.Vector3, deseado: THREE.Vector3, delta: number) {
  actual.x = THREE.MathUtils.damp(actual.x, deseado.x, 3, delta);
  actual.y = THREE.MathUtils.damp(actual.y, deseado.y, 3, delta);
  actual.z = THREE.MathUtils.damp(actual.z, deseado.z, 3, delta);
}

/**
 * Traduce cada etapa a un centro y un radio en coordenadas de mundo.
 *
 * Devuelve null mientras no haya nada medible, para reintentar en el próximo
 * frame: el .glb llega por Suspense y el ajuste de encuadre tarda unos frames
 * más en estabilizarse.
 */
function resolverEncuadres(
  escena: THREE.Object3D,
  etapas: EtapaRecorrido[],
  tamano: number,
): { encuadres: Encuadre[]; algunoReal: boolean } {
  let algunoReal = false;

  const encuadres = etapas.map((etapa) => {
    const caja = new THREE.Box3();
    let vacia = true;

    for (const nombre of etapa.anclas) {
      const nodo = escena.getObjectByName(nombre);
      if (!nodo) continue;
      const cajaNodo = new THREE.Box3().setFromObject(nodo);
      if (cajaNodo.isEmpty()) continue;
      caja.union(cajaNodo);
      vacia = false;
    }

    if (vacia) {
      // Sin nodos con ese nombre (silueta procedural): posición proporcional.
      return {
        centro: new THREE.Vector3(etapa.respaldo * tamano, tamano * 0.05, 0),
        radio: tamano * 0.28,
      };
    }

    algunoReal = true;
    const medidas = caja.getSize(new THREE.Vector3());
    return {
      centro: caja.getCenter(new THREE.Vector3()),
      // Un piso de radio evita que un equipo chico pegue la cámara contra él.
      radio: Math.max(Math.max(medidas.x, medidas.y, medidas.z), tamano * 0.18),
    };
  });

  // Se marca si el resultado vino de nodos reales, para que quien llama sepa
  // que lo que tiene entre manos no son solo posiciones de respaldo.
  return { encuadres, algunoReal };
}
