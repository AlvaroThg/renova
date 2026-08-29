'use client';

import { useRef } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { MODELOS_3D } from '@renova/shared';
import { Escena } from '@/components/three/Escena';
import { Model3D } from '@/components/three/Model3D';
import { CamaraRecorrido } from '@/components/three/CamaraRecorrido';
import { NODOS_ESCENOGRAFIA } from '@/components/three/nodos-planta';
import { ProveedorProgreso, useProgresoScroll } from '@/components/three/progreso-scroll';

/** Ancho al que se normaliza la planta en esta sección, en unidades de escena. */
const TAMANO_PLANTA = 10;

/** Cada paso corresponde a una etapa de ETAPAS_PLANTA, en el mismo orden. */
const PASOS = [
  {
    titulo: 'Recepción y triturado',
    texto:
      'El residuo orgánico llega desde los mercados y comedores aliados. Se pesa, se separa lo que no sirve y pasa por el triturador: cuanto más chica la partícula, más rápido la digieren las bacterias.',
  },
  {
    titulo: 'Biodigestión anaerobia',
    texto:
      'Dentro del biodigestor tubular de geomembrana, sin oxígeno y a 33–37 °C, las bacterias metanogénicas degradan la materia orgánica. Es el mismo proceso que ocurre en un relleno sanitario, pero controlado y capturado.',
  },
  {
    titulo: 'Captura del biogás',
    texto:
      'El gas se acumula en la parte superior del digestor y sale por la línea de conducción. Entre 55 % y 70 % es metano — el mismo compuesto que hoy el país está dejando de producir.',
  },
  {
    titulo: 'Almacenamiento y uso',
    texto:
      'El gasómetro amortigua la producción y entrega presión estable. Desde ahí alimenta uso térmico directo o un grupo electrógeno, y el digestato que queda vuelve al campo como biol fertilizante.',
  },
];

export function SeccionSolucion() {
  return (
    <ProveedorProgreso>
      <ContenidoSolucion />
    </ProveedorProgreso>
  );
}

function ContenidoSolucion() {
  const contenedor = useRef<HTMLElement>(null);
  const progreso = useProgresoScroll();

  const { scrollYProgress } = useScroll({
    target: contenedor,
    offset: ['start start', 'end end'],
  });

  // Puente DOM → 3D: se escribe en la ref, sin provocar un solo re-render.
  useMotionValueEvent(scrollYProgress, 'change', (valor) => {
    progreso.current = valor;
  });

  return (
    <section id="solucion" ref={contenedor} className="relative h-[400vh] scroll-mt-16 bg-fondo">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0">
          <Escena camara={[-6.6, 2.4, 8.5]} fov={45}>
            {/* Mismo `tamano` en ambos: las paradas de cámara son fracciones del
                ancho del modelo, así que tienen que hablar de la misma escala. */}
            <CamaraRecorrido tamano={TAMANO_PLANTA} />
            <Model3D
              modelPath={MODELOS_3D.planta}
              fallbackShape="planta"
              tamano={TAMANO_PLANTA}
              ejeEncuadre="mayor"
              ignorarAlEncuadrar={NODOS_ESCENOGRAFIA}
              autoRotate={false}
              hoverZoom={false}
              interactive={false}
            />
          </Escena>
        </div>

        {/* Dos degradados: el vertical funde la escena con las secciones vecinas,
            el horizontal garantiza que el texto se lea aunque el modelo pase por detrás. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-fondo via-transparent to-fondo/60" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-fondo via-fondo/75 to-transparent" />

        <div className="contenedor-renova relative flex h-full items-center">
          <div className="w-full max-w-lg">
            <p className="etiqueta-seccion">La solución</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
              De la tolva de recepción al gasómetro
            </h2>

            {/* Los cuatro bloques ocupan el mismo lugar; el scroll decide cuál se ve. */}
            <div className="relative mt-8 h-56">
              {PASOS.map((paso, indice) => (
                <BloquePaso
                  key={paso.titulo}
                  paso={paso}
                  indice={indice}
                  total={PASOS.length}
                  progreso={scrollYProgress}
                />
              ))}
            </div>

            <IndicadorPasos total={PASOS.length} progreso={scrollYProgress} />
          </div>
        </div>
      </div>
    </section>
  );
}

function BloquePaso({
  paso,
  indice,
  total,
  progreso,
}: {
  paso: (typeof PASOS)[number];
  indice: number;
  total: number;
  progreso: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  // Cada paso ocupa una franja igual del scroll y se centra en su punto medio:
  // con esta partición ningún rango de interpolación se sale de [0, 1], que es
  // lo que Framer Motion exige (offsets negativos rompen la animación en runtime).
  const mitad = 1 / (total * 2);
  const centro = (indice * 2 + 1) * mitad;

  // Aparece al acercarse su tramo y se va al pasar: un cross-fade continuo.
  const opacidad = useTransform(
    progreso,
    [centro - mitad, centro - mitad * 0.5, centro + mitad * 0.5, centro + mitad],
    [0, 1, 1, 0],
  );
  const desplazamiento = useTransform(
    progreso,
    [centro - mitad, centro, centro + mitad],
    [24, 0, -24],
  );

  return (
    <motion.div style={{ opacity: opacidad, y: desplazamiento }} className="absolute inset-x-0 top-0">
      <p className="font-mono text-sm text-acento">0{indice + 1}</p>
      <h3 className="mt-2 text-2xl font-semibold text-texto">{paso.titulo}</h3>
      <p className="mt-3 leading-relaxed text-texto-tenue">{paso.texto}</p>
    </motion.div>
  );
}

/** Barra de avance del recorrido: le dice al lector cuánto falta. */
function IndicadorPasos({
  total,
  progreso,
}: {
  total: number;
  progreso: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const escala = useTransform(progreso, [0, 1], [0, 1]);

  return (
    <div className="mt-10">
      <div className="h-px w-full bg-borde">
        <motion.div style={{ scaleX: escala }} className="h-px origin-left bg-acento" />
      </div>
      <div className="mt-3 flex justify-between font-mono text-[11px] uppercase tracking-widest text-texto-debil">
        <span>Recepción</span>
        <span>Gasómetro</span>
      </div>
      <span className="sr-only">Recorrido de {total} etapas del proceso</span>
    </div>
  );
}
