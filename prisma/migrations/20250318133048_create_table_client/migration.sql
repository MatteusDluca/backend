-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cpf_cnpj" TEXT NOT NULL,
    "instagram" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "addressId" TEXT,
    "measurementsId" TEXT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" TEXT NOT NULL,
    "shoulder" DOUBLE PRECISION,
    "bust" DOUBLE PRECISION,
    "shoulderToWaistLength" DOUBLE PRECISION,
    "shoulderToCosLength" DOUBLE PRECISION,
    "tqcLength" DOUBLE PRECISION,
    "waist" DOUBLE PRECISION,
    "cos" DOUBLE PRECISION,
    "hip" DOUBLE PRECISION,
    "shortSkirtLength" DOUBLE PRECISION,
    "longSkirtLength" DOUBLE PRECISION,
    "shortLength" DOUBLE PRECISION,
    "pantsLength" DOUBLE PRECISION,
    "dressLength" DOUBLE PRECISION,
    "sleeveLength" DOUBLE PRECISION,
    "wrist" DOUBLE PRECISION,
    "frontMeasure" DOUBLE PRECISION,
    "shoulderToShoulderWidth" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_phone_key" ON "clients"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "clients_cpf_cnpj_key" ON "clients"("cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "clients_measurementsId_key" ON "clients"("measurementsId");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_measurementsId_fkey" FOREIGN KEY ("measurementsId") REFERENCES "measurements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
