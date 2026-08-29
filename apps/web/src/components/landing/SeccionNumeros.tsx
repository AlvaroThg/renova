'use client';

import { motion } from 'framer-motion';
import {
  BIOGAS_BASE_M3_DIA,
  INGRESO_BASE_BS_MES,
  RESIDUO_BASE_KG_DIA,
} from '@renova/shared';
import { ContadorAnimado } from '@/components/ui/ContadorAnimado';

/** Las cifras salen de las constantes del dominio: la landing no recalcula nada. */
const CIFRAS = [
  {
    valor: RESIDUO_BASE_KG_DIA,
    sufijo: ' kg',
    etiqueta: 'de residuo orgánico procesado por día',
    nota: 'Equivale a la materia orgánica descartada por un mercado mediano.',
  },
  {
    valor: BIOGAS_BASE_M3_DIA,
    sufijo: ' m³',
    etiqueta: 'de biogás producido por día',
    nota: 'Entre 55 % y 70 % metano, listo para uso térmico o generación.',
  },
  {
    valor: INGRESO_BASE_BS_MES,
    prefijo: 'Bs ',
    etiqueta: 'de ingreso mensual del piloto',
    nota: 'Sin contar el ahorro en disposición final ni el valor del biol.',
  },
];

export function SeccionNumeros() {
  return (
    <section id="numeros" className="scroll-mt-16 border-t border-borde bg-superficie py-28">
      <div className="contenedor-renova">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.6 }}
        >
          <p className="etiqueta-seccion">Los números</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            Una unidad piloto que cierra sus cuentas
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-texto-tenue">
            No es una proyección de laboratorio: son los parámetros de operación del piloto,
            los mismos que el sistema de gestión mide todos los días.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {CIFRAS.map((cifra, i) => (
            <motion.div
              key={cifra.etiqueta}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className="tarjeta flex flex-col justify-between p-7"
            >
              <p className="text-5xl font-bold tracking-tight text-acento">
                <ContadorAnimado
                  valor={cifra.valor}
                  prefijo={cifra.prefijo}
                  sufijo={cifra.sufijo}
                />
              </p>
              <p className="mt-4 text-base font-medium text-texto">{cifra.etiqueta}</p>
              <p className="mt-3 border-t border-borde pt-3 text-sm leading-relaxed text-texto-tenue">
                {cifra.nota}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 grid gap-4 rounded-xl border border-borde bg-superficie-alta p-6 sm:grid-cols-3"
        >
          <Detalle titulo="Rendimiento" valor="0,175 m³ de biogás por kg de residuo" />
          <Detalle titulo="Régimen térmico" valor="Mesofílico, 33–37 °C" />
          <Detalle titulo="Retorno del digestato" valor="Biol fertilizante al productor" />
        </motion.div>
      </div>
    </section>
  );
}

function Detalle({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-texto-debil">{titulo}</p>
      <p className="mt-1.5 text-sm text-texto">{valor}</p>
    </div>
  );
}
