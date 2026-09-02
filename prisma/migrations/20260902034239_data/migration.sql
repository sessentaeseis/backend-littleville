/*
  Warnings:

  - You are about to drop the column `encontradoEm` on the `avistamentos` table. All the data in the column will be lost.
  - Added the required column `data` to the `avistamentos` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "avistamentos_encontradoEm_idx";

-- AlterTable
ALTER TABLE "avistamentos" DROP COLUMN "encontradoEm",
ADD COLUMN     "data" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "avistamentos_data_idx" ON "avistamentos"("data");
