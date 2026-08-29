'use client';

import { motion } from 'framer-motion';
import { Escena } from '@/components/three/Escena';
import { Model3D } from '@/components/three/Model3D';
import type { FormaModelo } from '@/components/three/ModeloProcedural';

interface Props {
  id: string;
  etiqueta: string;
  titulo: string;
  parrafos: string[];
  especificaciones: Array<{ clave: string; valor: string }>;
  modelPath: string;
  fallbackShape: FormaModelo;
  /** Alterna el lado del modelo para que dos secciones seguidas no se repitan. */
  invertido?: boolean;
}

/**
 * Sección dedicada a un equipo de la planta.
 *
 * El modelo tiene su propio espacio cuadrado en vez de ir apretado en una
 * esquina: el contenedor es `aspect-square` y el modelo se normaliza con
 * `tamano`, así que siempre entra completo sin importar cómo se exportó el .glb.
 */
export function SeccionEquipo({
  id,
  etiqueta,
  titulo,
  parrafos,
  especificaciones,
  modelPath,
  fallbackShape,
  invertido = false,
}: Props) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-borde py-24">
      <div className="contenedor-renova">
        <div
          className={`grid items-center gap-12 lg:grid-cols-2 ${
            invertido ? 'lg:[&>*:first-child]:order-2' : ''
          }`}
        >
          {/* Contenedor cuadrado: la cámara está calibrada para esta proporción. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mx-auto w-full max-w-[440px]"
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-borde bg-superficie">
              <Escena camara={[0, 0.9, 6.5]} fov={38}>
                <Model3D
                  modelPath={modelPath}
                  fallbackShape={fallbackShape}
                  // Calibrado para el contenedor cuadrado y esta cámara: deja
                  // margen suficiente para que el giro no recorte el modelo.
                  tamano={3.4}
                  autoRotate
                  rotationSpeed={0.18}
                  hoverZoom
                  hoverScale={1.12}
                  interactive={false}
                />
              </Escena>

              <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-texto-debil">
                Pasá el cursor para acercar
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="etiqueta-seccion">{etiqueta}</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">{titulo}</h2>

            {parrafos.map((parrafo) => (
              <p key={parrafo} className="mt-5 leading-relaxed text-texto-tenue">
                {parrafo}
              </p>
            ))}

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-borde pt-6">
              {especificaciones.map((especificacion) => (
                <div key={especificacion.clave}>
                  <dt className="font-mono text-[11px] uppercase tracking-widest text-texto-debil">
                    {especificacion.clave}
                  </dt>
                  <dd className="mt-1 text-sm text-texto">{especificacion.valor}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
