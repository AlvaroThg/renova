'use client';

import { motion } from 'framer-motion';
import { MODELOS_3D } from '@renova/shared';
import { SeccionEquipo } from './SeccionEquipo';

/**
 * Los dos equipos del piloto, cada uno con su propia sección.
 *
 * Antes compartían espacio con otros contenidos y se veían recortados; acá cada
 * modelo manda en su bloque y el texto lo acompaña en vez de competirle.
 */
export function SeccionEquipos() {
  return (
    <>
      <section id="equipos" className="scroll-mt-16 border-t border-borde bg-superficie pt-24">
        <div className="contenedor-renova">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="etiqueta-seccion">Los equipos</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
              Dos piezas, ninguna exótica
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-texto-tenue">
              No hay tecnología de frontera acá, y eso es una virtud: todo el equipamiento
              del piloto se fabrica y se repara en Santa Cruz. El riesgo del proyecto está
              en la logística del residuo, no en el hardware.
            </p>
          </motion.div>
        </div>
      </section>

      <SeccionEquipo
        id="biodigestor"
        etiqueta="Equipo 01"
        titulo="Biodigestor tubular de geomembrana"
        parrafos={[
          'Un reactor anaerobio de flujo pistón: la mezcla entra por un extremo, avanza mientras se degrada y sale por el otro como digestato. La geomembrana es barata, liviana y se repara con parches en sitio.',
          'Adentro no hay oxígeno y la temperatura se sostiene entre 33 y 37 °C. En ese régimen las bacterias metanogénicas trabajan a buen ritmo sin el gasto energético de un sistema termofílico.',
        ]}
        especificaciones={[
          { clave: 'Volumen', valor: '120 m³' },
          { clave: 'Régimen', valor: 'Mesofílico, 33–37 °C' },
          { clave: 'Retención', valor: '~30 días' },
          { clave: 'Sensores', valor: 'Temperatura, pH, humedad' },
        ]}
        modelPath={MODELOS_3D.biodigestor}
        fallbackShape="tubular"
      />

      <SeccionEquipo
        id="gasometro"
        etiqueta="Equipo 02"
        titulo="Gasómetro de almacenamiento"
        parrafos={[
          'El biogás no se produce a ritmo constante ni se consume a ritmo constante. El gasómetro es el amortiguador entre ambas cosas: acumula durante las horas de baja demanda y entrega presión estable cuando hace falta.',
          'Es también el punto donde se mide la calidad del gas. Si el metano baja o el sulfuro de hidrógeno sube, el problema está aguas arriba en la digestión y se corrige antes de que llegue al quemador.',
        ]}
        especificaciones={[
          { clave: 'Presión de trabajo', valor: '0,02–0,05 bar' },
          { clave: 'Metano', valor: '55–70 %' },
          { clave: 'Sensores', valor: 'Presión, CH₄, CO₂, H₂S' },
          { clave: 'Salida', valor: 'Uso térmico o generación' },
        ]}
        modelPath={MODELOS_3D.gasometro}
        fallbackShape="domo"
        invertido
      />
    </>
  );
}
