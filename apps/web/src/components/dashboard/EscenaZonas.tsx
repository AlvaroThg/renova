'use client';

import { EstadoSensor, MODELOS_3D, Zona } from '@renova/shared';
import { Escena } from '@/components/three/Escena';
import { Model3D } from '@/components/three/Model3D';
import { useColoresEstado } from '@/lib/colores';

interface Props {
  estadoPorZona: Record<Zona, EstadoSensor>;
  zonaSeleccionada: Zona | null;
  onSeleccionar: (zona: Zona) => void;
}

/**
 * Vista 3D del piloto en el dashboard.
 *
 * Se usan los dos modelos individuales y no la planta completa a propósito: cada
 * zona tiene que poder colorearse y seleccionarse por separado, y eso es directo
 * con modelos independientes en vez de sub-mallas dentro de un único archivo.
 *
 * Ambos se normalizan al mismo `tamano`, así que se ven comparables entre sí
 * aunque los .glb vengan exportados con escalas distintas.
 */
export function EscenaZonas({ estadoPorZona, zonaSeleccionada, onSeleccionar }: Props) {
  const colores = useColoresEstado();

  return (
    <div className="h-[380px] w-full overflow-hidden rounded-xl border border-borde bg-superficie">
      <Escena camara={[0, 1.6, 9]} fov={40}>
        <Model3D
          modelPath={MODELOS_3D.biodigestor}
          fallbackShape="tubular"
          tamano={2.6}
          interactive
          onSelect={() => onSeleccionar('biodigestor')}
          pinned={zonaSeleccionada === 'biodigestor'}
          statusColor={colores[estadoPorZona.biodigestor]}
          rotationSpeed={0.12}
          hoverScale={1.1}
          posicion={[-1.9, 0, 0]}
        />
        <Model3D
          modelPath={MODELOS_3D.gasometro}
          fallbackShape="domo"
          tamano={2.6}
          interactive
          onSelect={() => onSeleccionar('gasometro')}
          pinned={zonaSeleccionada === 'gasometro'}
          statusColor={colores[estadoPorZona.gasometro]}
          rotationSpeed={0.12}
          hoverScale={1.1}
          posicion={[1.9, 0, 0]}
        />
      </Escena>
    </div>
  );
}
