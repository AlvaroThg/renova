import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { META_VARIABLES, TIPOS_VARIABLE, TipoVariable } from '@renova/shared';
import { RANGOS_OPERATIVOS } from '../src/domain/lectura/rango-operativo';

const prisma = new PrismaClient();

/** Historial sintético para que los gráficos del dashboard no arranquen vacíos. */
const DIAS_HISTORIAL = 30;
const HORAS_LECTURAS = 24;
const MINUTOS_ENTRE_LECTURAS = 10;

async function main(): Promise<void> {
  console.log('Sembrando datos del piloto RENOVA...');

  await sembrarAdmin();
  const biodigestorId = await sembrarBiodigestorYSensores();
  const generadores = await sembrarGeneradores();
  await sembrarEntregas(generadores);
  await sembrarLecturas(biodigestorId);

  console.log('Seed completo.');
}

async function sembrarAdmin(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@renova.bo').toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'renova2026';
  const nombre = process.env.ADMIN_NOMBRE ?? 'Operador RENOVA';

  await prisma.usuario.upsert({
    where: { email },
    update: { nombre },
    create: {
      id: randomUUID(),
      email,
      nombre,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });
  console.log(`  Usuario administrador: ${email}`);
}

async function sembrarBiodigestorYSensores(): Promise<string> {
  const existente = await prisma.biodigestor.findFirst();
  if (existente) {
    console.log('  Biodigestor ya existente, se reutiliza');
    return existente.id;
  }

  const biodigestor = await prisma.biodigestor.create({
    data: {
      id: randomUUID(),
      nombre: 'Biodigestor tubular RENOVA 01',
      capacidadM3: 120,
      ubicacion: 'Planta piloto — Mercado Campesino',
    },
  });

  await prisma.sensor.createMany({
    data: TIPOS_VARIABLE.map((variable) => ({
      id: randomUUID(),
      biodigestorId: biodigestor.id,
      variable,
      zona: META_VARIABLES[variable].zona,
      etiqueta: META_VARIABLES[variable].etiqueta,
      activo: true,
    })),
  });

  console.log(`  Biodigestor + ${TIPOS_VARIABLE.length} sensores creados`);
  return biodigestor.id;
}

async function sembrarGeneradores(): Promise<Array<{ id: string; kgPromedio: number }>> {
  const definiciones = [
    {
      nombre: 'Mercado Campesino',
      tipo: 'Mercado',
      direccion: 'Av. Cañoto esq. Isabel La Católica',
      contacto: 'Administración de mercado',
      kgPromedio: 1200,
    },
    {
      nombre: 'Mercado Los Pozos',
      tipo: 'Mercado',
      direccion: 'C. Quijarro, zona central',
      contacto: 'Junta de comerciantes',
      kgPromedio: 520,
    },
    {
      nombre: 'Comedor Universitario UAGRM',
      tipo: 'Comedor institucional',
      direccion: 'Campus universitario',
      contacto: 'Jefatura de servicios',
      kgPromedio: 180,
    },
    {
      nombre: 'Feria Barrio Norte',
      tipo: 'Feria itinerante',
      direccion: 'Barrio Norte, sábados',
      contacto: 'Coordinación vecinal',
      kgPromedio: 140,
    },
  ];

  const generadores: Array<{ id: string; kgPromedio: number }> = [];
  for (const def of definiciones) {
    const existente = await prisma.generador.findFirst({ where: { nombre: def.nombre } });
    if (existente) {
      generadores.push({ id: existente.id, kgPromedio: def.kgPromedio });
      continue;
    }
    const creado = await prisma.generador.create({
      data: {
        id: randomUUID(),
        nombre: def.nombre,
        tipo: def.tipo,
        direccion: def.direccion,
        contacto: def.contacto,
        activo: true,
      },
    });
    generadores.push({ id: creado.id, kgPromedio: def.kgPromedio });
  }

  console.log(`  ${generadores.length} generadores de residuo creados`);
  return generadores;
}

async function sembrarEntregas(
  generadores: Array<{ id: string; kgPromedio: number }>,
): Promise<void> {
  if ((await prisma.entregaResiduo.count()) > 0) {
    console.log('  Entregas ya existentes, se omiten');
    return;
  }

  const entregas: Array<{
    id: string;
    generadorId: string;
    cantidadKg: number;
    fecha: Date;
    origen: string;
  }> = [];

  for (let dia = DIAS_HISTORIAL - 1; dia >= 0; dia--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dia);
    fecha.setHours(7, 30, 0, 0);

    for (const generador of generadores) {
      // Variación de ±25 % día a día: la recolección real nunca es constante.
      const factor = 0.75 + Math.random() * 0.5;
      entregas.push({
        id: randomUUID(),
        generadorId: generador.id,
        cantidadKg: Number((generador.kgPromedio * factor).toFixed(1)),
        fecha: new Date(fecha),
        origen: 'manual',
      });
    }
  }

  await prisma.entregaResiduo.createMany({ data: entregas });
  console.log(`  ${entregas.length} entregas de residuo sembradas (${DIAS_HISTORIAL} días)`);
}

async function sembrarLecturas(biodigestorId: string): Promise<void> {
  if ((await prisma.lectura.count()) > 0) {
    console.log('  Lecturas ya existentes, se omiten');
    return;
  }

  const sensores = await prisma.sensor.findMany({ where: { biodigestorId } });
  const ahora = new Date();
  const muestras = (HORAS_LECTURAS * 60) / MINUTOS_ENTRE_LECTURAS;

  const filas: Array<{
    id: string;
    sensorId: string;
    variable: string;
    zona: string;
    valor: number;
    estado: string;
    timestamp: Date;
  }> = [];

  for (const sensor of sensores) {
    const variable = sensor.variable as TipoVariable;
    const rango = RANGOS_OPERATIVOS[variable];
    const ancho = rango.optimoMax - rango.optimoMin || 1;
    let valor = rango.setpoint;

    for (let i = muestras; i >= 0; i--) {
      // Mismo random walk con reversión que usa el simulador en vivo,
      // para que el histórico y las lecturas nuevas se vean continuos.
      valor += (rango.setpoint - valor) * 0.1 + (Math.random() - 0.5) * ancho * 0.15;
      const timestamp = new Date(ahora.getTime() - i * MINUTOS_ENTRE_LECTURAS * 60 * 1000);
      filas.push({
        id: randomUUID(),
        sensorId: sensor.id,
        variable,
        zona: sensor.zona,
        valor: Number(valor.toFixed(4)),
        estado: rango.evaluar(valor),
        timestamp,
      });
    }
  }

  await prisma.lectura.createMany({ data: filas });
  console.log(`  ${filas.length} lecturas sembradas (${HORAS_LECTURAS} h de historial)`);
}

main()
  .catch((error) => {
    console.error('El seed falló:', error);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
