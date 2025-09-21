-- AlterTable
ALTER TABLE "Order" ADD COLUMN "city" TEXT;
ALTER TABLE "Order" ADD COLUMN "initialArea" REAL;
ALTER TABLE "Order" ADD COLUMN "measuredArea" REAL;
ALTER TABLE "Order" ADD COLUMN "phone" TEXT;
ALTER TABLE "Order" ADD COLUMN "selectedPanel" TEXT;

-- CreateTable
CREATE TABLE "Measurement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "installationAddress" TEXT NOT NULL,
    "trimMode" TEXT NOT NULL,
    "panelName" TEXT NOT NULL,
    "measuredArea" REAL NOT NULL,
    "wastePercentage" INTEGER NOT NULL,
    "installationDate" DATETIME,
    "deliveryDate" DATETIME,
    "deliveryOffsetDays" INTEGER,
    "carryNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Measurement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Measurement_orderId_key" ON "Measurement"("orderId");
