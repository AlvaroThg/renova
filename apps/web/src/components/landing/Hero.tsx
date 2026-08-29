'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MODELOS_3D } from '@renova/shared';
import { Escena } from '@/components/three/Escena';
import { Model3D } from '@/components/three/Model3D';
import { NODOS_ESCENOGRAFIA } from '@/components/three/nodos-planta';

/**
 * Apertura del pitch: la planta completa girando en loop y el gancho del problema.
 *
 * El modelo va en modo narrativo (idle + hover), sin click: acá no hay nada que
 * seleccionar, solo algo que mirar mientras se lee el titular.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* La escena vive detrás del texto y ocupa toda la pantalla. */}
      <div className="absolute inset-0 z-0">
        <Escena camara={[0, 3.2, 12]} fov={40}>
          <Model3D
            modelPath={MODELOS_3D.planta}
            fallbackShape="planta"
            // El terreno mide 46 × 46 y los equipos ocupan una fracción de eso:
            // se lo excluye de la medición para encuadrar el equipamiento, y la
            // retícula sigue dibujándose saliéndose de cuadro.
            tamano={9}
            ejeEncuadre="mayor"
            ignorarAlEncuadrar={NODOS_ESCENOGRAFIA}
            autoRotate
            rotationSpeed={0.15}
            hoverZoom
            hoverScale={1.08}
            interactive={false}
            posicion={[2, -0.4, 0]}
          />
        </Escena>
      </div>

      {/* Degradado para que el texto se lea sobre cualquier parte del modelo. */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-fondo via-fondo/80 to-transparent" />

      <div className="contenedor-renova relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-2xl py-32"
        >
          <p className="etiqueta-seccion">Valorización energética de residuos</p>

          <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            RENOVA
            <span className="mt-2 block text-acento">Basura en recurso</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-texto-tenue">
            Bolivia se está quedando sin gas. La producción nacional cae año a año y el
            subsidio que sostiene el precio ya no da. Mientras tanto, cada día toneladas de
            residuo orgánico terminan enterradas emitiendo metano a la atmósfera.
          </p>

          <p className="mt-4 max-w-xl text-lg leading-relaxed text-texto">
            Ese metano es exactamente el gas que nos falta.{' '}
            <span className="text-acento">Nosotros lo capturamos.</span>
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#solucion" className="boton-primario">
              Cómo funciona
            </a>
            <Link href="/dashboard" className="boton-secundario">
              Ver el piloto en vivo
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute inset-x-0 bottom-8 z-20 flex justify-center"
      >
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-texto-debil">
          Scrolleá para ver el proceso
        </span>
      </motion.div>
    </section>
  );
}
