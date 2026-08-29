import type { Config } from 'tailwindcss';

/**
 * Paleta RENOVA en dos temas.
 *
 * Los valores no viven acá sino en `globals.css` como canales RGB; Tailwind solo
 * los compone. Así `data-tema` en <html> cambia toda la interfaz sin recompilar
 * ni duplicar clases, y los modificadores de opacidad siguen funcionando.
 */
const conCanal = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fondo: conCanal('--c-fondo'),
        superficie: conCanal('--c-superficie'),
        'superficie-alta': conCanal('--c-superficie-alta'),
        borde: conCanal('--c-borde'),
        acento: {
          DEFAULT: conCanal('--c-acento'),
          suave: conCanal('--c-acento-suave'),
          oscuro: conCanal('--c-acento-oscuro'),
          marca: conCanal('--c-acento-marca'),
        },
        estado: {
          normal: conCanal('--c-estado-normal'),
          alerta: conCanal('--c-estado-alerta'),
          critico: conCanal('--c-estado-critico'),
        },
        texto: {
          DEFAULT: conCanal('--c-texto'),
          tenue: conCanal('--c-texto-tenue'),
          debil: conCanal('--c-texto-debil'),
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulso-lento': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
