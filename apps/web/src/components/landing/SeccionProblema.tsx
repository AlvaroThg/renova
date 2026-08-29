'use client';

import { motion } from 'framer-motion';
import { GraficoCaidaGas } from '@/components/graficos/GraficoCaidaGas';

const DATOS_DUROS = [
  {
    cifra: '−90 %',
    detalle: 'de caída proyectada en la producción de gas natural entre 2025 y 2040.',
  },
  {
    cifra: 'Importador',
    detalle: 'de ser exportador regional a importar gas y diésel con divisas escasas.',
  },
  {
    cifra: '25×',
    detalle: 'el metano de un relleno sanitario calienta más que el CO₂ a 100 años.',
  },
];

export function SeccionProblema() {
  return (
    <section id="problema" className="scroll-mt-16 border-t border-borde bg-superficie py-28">
      <div className="contenedor-renova">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.6 }}
        >
          <p className="etiqueta-seccion">El problema</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            La matriz energética que sostuvo al país se está apagando
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-texto-tenue">
            Los campos maduros declinan y no hay reposición de reservas al ritmo necesario.
            Cada año que pasa, el gas que Bolivia produce alcanza para menos: primero se
            perdió la exportación, después el superávit, y ahora aprieta el consumo interno.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="tarjeta">
            <h3 className="text-sm font-medium text-texto">
              Producción de gas natural — proyección 2025 → 2040
            </h3>
            <div className="mt-4">
              <GraficoCaidaGas />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-8">
            {DATOS_DUROS.map((dato, i) => (
              <motion.div
                key={dato.cifra}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="border-l-2 border-acento pl-5"
              >
                <p className="text-3xl font-bold text-texto">{dato.cifra}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-texto-tenue">{dato.detalle}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 max-w-3xl border-t border-borde pt-8 text-xl leading-relaxed"
        >
          Y al mismo tiempo, en un solo mercado de Santa Cruz se descartan{' '}
          <span className="text-acento">toneladas de materia orgánica por día</span> que hoy
          no valen nada y que van directo al relleno sanitario a fermentar sin control.
        </motion.p>
      </div>
    </section>
  );
}
