import { NavLanding } from '@/components/landing/NavLanding';
import { Hero } from '@/components/landing/Hero';
import { SeccionProblema } from '@/components/landing/SeccionProblema';
import { SeccionSolucion } from '@/components/landing/SeccionSolucion';
import { SeccionEquipos } from '@/components/landing/SeccionEquipos';
import { SeccionNumeros } from '@/components/landing/SeccionNumeros';
import { SeccionRoadmap } from '@/components/landing/SeccionRoadmap';
import { PieLanding, SeccionCTA } from '@/components/landing/SeccionCTA';

/**
 * Landing narrativa: sigue exactamente el orden del pitch — gancho, problema,
 * solución recorrida en 3D, números, roadmap y pedido de capital.
 */
export default function PaginaPresentacion() {
  return (
    <main>
      <NavLanding />
      <Hero />
      <SeccionProblema />
      <SeccionSolucion />
      <SeccionEquipos />
      <SeccionNumeros />
      <SeccionRoadmap />
      <SeccionCTA />
      <PieLanding />
    </main>
  );
}
