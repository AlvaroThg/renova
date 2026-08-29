'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const DESTINO_CAPITAL = [
  { porcentaje: '45 %', item: 'Biodigestor, gasómetro y obra civil' },
  { porcentaje: '25 %', item: 'Logística de recolección y triturado' },
  { porcentaje: '20 %', item: 'Instrumentación y sistema de control' },
  { porcentaje: '10 %', item: 'Capital de trabajo de los primeros meses' },
];

export function SeccionCTA() {
  return (
    <section className="relative overflow-hidden border-t border-borde bg-superficie py-28">
      <div className="contenedor-renova relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="etiqueta-seccion">La oportunidad</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
            Invertí en RENOVA
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-texto-tenue">
            Buscamos <span className="text-texto">capital semilla</span> para completar la
            Fase 1 y dejar el piloto operando a plena carga. El equipo está armado, el
            convenio con el mercado está firmado y la tecnología ya no es el riesgo.
          </p>

          <div className="mt-10 space-y-3">
            {DESTINO_CAPITAL.map((linea) => (
              <div
                key={linea.item}
                className="flex items-baseline gap-4 border-b border-borde pb-3"
              >
                <span className="w-16 shrink-0 font-mono text-sm text-acento">
                  {linea.porcentaje}
                </span>
                <span className="text-sm text-texto-tenue">{linea.item}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <a href="mailto:contacto@renova.bo" className="boton-primario">
              Hablemos del piloto
            </a>
            <Link href="/dashboard" className="boton-secundario">
              Entrar al sistema de gestión
            </Link>
          </div>

          <p className="mt-6 text-sm text-texto-debil">
            El sistema de gestión es una demo funcional del piloto: métricas en vivo,
            producción, alertas y generadores de residuo.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function PieLanding() {
  return (
    <footer className="border-t border-borde py-10">
      <div className="contenedor-renova flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="font-mono text-sm font-bold">RENOVA</p>
        <p className="text-xs text-texto-debil">
          Valorización energética de residuos orgánicos · Santa Cruz de la Sierra, Bolivia
        </p>
      </div>
    </footer>
  );
}
