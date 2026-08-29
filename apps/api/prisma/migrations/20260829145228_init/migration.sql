-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biodigestores" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "capacidadM3" DOUBLE PRECISION NOT NULL,
    "ubicacion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biodigestores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensores" (
    "id" TEXT NOT NULL,
    "biodigestorId" TEXT NOT NULL,
    "variable" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sensores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturas" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "variable" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lecturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" TEXT NOT NULL,
    "variable" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "severidad" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "reconocida" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generadores" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "direccion" TEXT,
    "contacto" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas_residuo" (
    "id" TEXT NOT NULL,
    "generadorId" TEXT NOT NULL,
    "cantidadKg" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "origen" TEXT NOT NULL DEFAULT 'manual',
    "observaciones" TEXT,

    CONSTRAINT "entregas_residuo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sensores_biodigestorId_variable_key" ON "sensores"("biodigestorId", "variable");

-- CreateIndex
CREATE INDEX "lecturas_variable_timestamp_idx" ON "lecturas"("variable", "timestamp");

-- CreateIndex
CREATE INDEX "lecturas_sensorId_timestamp_idx" ON "lecturas"("sensorId", "timestamp");

-- CreateIndex
CREATE INDEX "alertas_timestamp_idx" ON "alertas"("timestamp");

-- CreateIndex
CREATE INDEX "alertas_variable_timestamp_idx" ON "alertas"("variable", "timestamp");

-- CreateIndex
CREATE INDEX "entregas_residuo_fecha_idx" ON "entregas_residuo"("fecha");

-- CreateIndex
CREATE INDEX "entregas_residuo_generadorId_fecha_idx" ON "entregas_residuo"("generadorId", "fecha");

-- AddForeignKey
ALTER TABLE "sensores" ADD CONSTRAINT "sensores_biodigestorId_fkey" FOREIGN KEY ("biodigestorId") REFERENCES "biodigestores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "sensores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_residuo" ADD CONSTRAINT "entregas_residuo_generadorId_fkey" FOREIGN KEY ("generadorId") REFERENCES "generadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
