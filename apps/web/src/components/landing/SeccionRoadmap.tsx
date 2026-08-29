'use client';

import { motion } from 'framer-motion';

const FASES = [
  {
    fase: 'Fase 1',
    titulo: 'Piloto operativo',
    plazo: 'Meses 1 – 6',
    puntos: [
      'Un biodigestor tubular de 120 m³ en convenio con el Mercado Campesino',
      '2.000 kg/día de residuo con logística de recolección propia',
      'Sistema de gestión y sensores en línea validando el proceso',
    ],
    estado: 'En ejecución',
  },
  {
    fase: 'Fase 2',
    titulo: 'Escalamiento',
    plazo: 'Meses 7 – 18',
    puntos: [
      'Tres módulos adicionales y un segundo punto de acopio',
      'Generación eléctrica con grupo electrógeno a biogás',
      'Comercialización formal del biol como fertilizante',
    ],
    estado: 'Financiamiento en curso',
  },
  {
    fase: 'Fase 3',
    titulo: 'Expansión regional',
    plazo: 'Año 2 en adelante',
    puntos: [
      'Réplica del modelo en otros mercados de Santa Cruz',
      'Convenios con municipios para desvío de residuo del relleno',
      'Certificación de reducción de emisiones',
    ],
    estado: 'Proyectado',
  },
];

export function SeccionRoadmap() {
  return (
    <section id="roadmap" className="scroll-mt-16 border-t border-borde py-28">
      <div className="contenedor-renova">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.6 }}
        >
          <p className="etiqueta-seccion">Roadmap</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
            De un mercado a una red
          </h2>
        </motion.div>

        <div className="relative mt-16">
          {/* Eje del timeline, detrás de las tarjetas. */}
          <div className="absolute left-0 right-0 top-[22px] hidden h-px bg-borde md:block" />

          <div className="grid gap-8 md:grid-cols-3">
            {FASES.map((fase, i) => (
              <motion.div
                key={fase.fase}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.55, delay: i * 0.15 }}
                className="relative"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-mono text-sm ${
                      i === 0
                        ? 'border-acento bg-acento text-fondo'
                        : 'border-borde bg-fondo text-texto-tenue'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-texto-debil">
                    {fase.plazo}
                  </span>
                </div>

                <div className="tarjeta mt-5 h-full">
                  <p className="font-mono text-xs uppercase tracking-widest text-acento">
                    {fase.fase}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{fase.titulo}</h3>

                  <ul className="mt-4 space-y-2.5">
                    {fase.puntos.map((punto) => (
                      <li key={punto} className="flex gap-2.5 text-sm leading-relaxed text-texto-tenue">
                        <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-acento" />
                        {punto}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-5 border-t border-borde pt-3 text-xs text-texto-debil">
                    {fase.estado}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
