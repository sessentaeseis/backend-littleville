/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `sightings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nome` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "sightings" DROP CONSTRAINT "sightings_userId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
DROP COLUMN "password",
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "senha" TEXT NOT NULL;

-- DropTable
DROP TABLE "sightings";

-- CreateTable
CREATE TABLE "avistamentos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criatura" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "encontradoEm" TIMESTAMP(3) NOT NULL,
    "confianca" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avistamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "avistamentos_criatura_idx" ON "avistamentos"("criatura");

-- CreateIndex
CREATE INDEX "avistamentos_localizacao_idx" ON "avistamentos"("localizacao");

-- CreateIndex
CREATE INDEX "avistamentos_encontradoEm_idx" ON "avistamentos"("encontradoEm");

-- AddForeignKey
ALTER TABLE "avistamentos" ADD CONSTRAINT "avistamentos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
