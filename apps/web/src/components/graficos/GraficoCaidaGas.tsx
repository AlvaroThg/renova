'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTema } from '@/lib/tema';
import { estiloEje, estiloTooltip, tokensGrafico } from './tokens';

/**
 * Proyección de declinación de la producción de gas natural en Bolivia.
 *
 * Serie única: el lector solo tiene que ver una cosa, que la curva baja. Por eso
 * no lleva leyenda (el título dice qué se grafica) ni un número sobre cada punto.
 */
const SERIE = [
  { anio: '2025', produccion: 30 },
  { anio: '2027', produccion: 25 },
  { anio: '2030', produccion: 18 },
  { anio: '2033', produccion: 12 },
  { anio: '2036', produccion: 7 },
  { anio: '2040', produccion: 3 },
];

export function GraficoCaidaGas() {
  const contenedor = useRef<HTMLDivElement>(null);
  const visible = useInView(contenedor, { once: true, margin: '-15%' });
  const { tema } = useTema();
  const t = tokensGrafico(tema);

  return (
    <div ref={contenedor} className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="h-[320px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={SERIE} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
            <defs>
              {/* Relleno como lavado al ~10 %, nunca un bloque saturado. */}
              <linearGradient id="degradadoCaida" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={t.serieProblema} stopOpacity={0.22} />
                <stop offset="100%" stopColor={t.serieProblema} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={t.rejilla} strokeWidth={1} vertical={false} />
            <XAxis dataKey="anio" {...estiloEje(t)} />
            <YAxis {...estiloEje(t)} width={44} domain={[0, 32]} />
            <Tooltip
              {...estiloTooltip(t)}
              formatter={(valor: number) => [`${valor} MMm³/día`, 'Producción']}
            />
            <Area
              type="monotone"
              dataKey="produccion"
              stroke={t.serieProblema}
              strokeWidth={2}
              strokeLinecap="round"
              fill="url(#degradadoCaida)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: t.superficie }}
              isAnimationActive={visible}
              animationDuration={1400}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <p className="mt-3 text-xs text-texto-debil">
        Producción de gas natural en MMm³/día — proyección de declinación citada en el pitch
        (YPFB). Reemplazar por la serie oficial exacta antes de publicar.
      </p>
    </div>
  );
}
