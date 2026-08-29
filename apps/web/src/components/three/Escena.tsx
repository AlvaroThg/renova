'use client';

import { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { COLOR_ACENTO } from '@renova/shared';
import { useTema } from '@/lib/tema';

interface Props {
  children: ReactNode;
  /** Posición inicial de la cámara. */
  camara?: [number, number, number];
  fov?: number;
  className?: string;
}

/**
 * Canvas compartido por landing y dashboard: misma iluminación, mismo look.
 *
 * El canvas es siempre transparente y deja ver el fondo del contenedor, así el
 * cambio de tema no necesita repintar la escena: el color lo pone el CSS.
 */
export function Escena({ children, camara = [0, 1.6, 9], fov = 42, className }: Props) {
  const { tema } = useTema();
  const claro = tema === 'claro';

  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      shadows
      // `flat` desactiva el tone mapping ACES que R3F trae por defecto: sobre una
      // paleta oscura aplasta los medios tonos y deja los equipos casi negros.
      flat
      gl={{ alpha: true, antialias: true }}
      camera={{ position: camara, fov }}
    >
      <ambientLight intensity={claro ? 1.05 : 0.7} />
      {/* Luz principal alta, para volumen. */}
      <directionalLight position={[6, 9, 5]} intensity={claro ? 1.9 : 1.6} castShadow />
      {/* Relleno frontal desde la cámara: sin esto las caras que mira el usuario
          quedan en sombra y el modelo se lee como una silueta plana. */}
      <directionalLight position={[1, 2, 10]} intensity={claro ? 0.9 : 1.1} />
      {/* Contraluz en el lima de marca: despega la silueta del fondo.
          En claro se baja, porque ahí el contraste ya lo da el fondo. */}
      <directionalLight
        position={[-7, 3, -5]}
        intensity={claro ? 0.35 : 0.8}
        color={COLOR_ACENTO}
      />
      <hemisphereLight
        args={claro ? ['#FFFFFF', '#C6CEBB', 0.9] : ['#A8BC98', '#141810', 0.6]}
      />
      {children}
    </Canvas>
  );
}
