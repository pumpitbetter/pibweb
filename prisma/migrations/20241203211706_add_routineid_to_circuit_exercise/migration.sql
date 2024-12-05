/*
  Warnings:

  - Added the required column `routineId` to the `CircuitExercise` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CircuitExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circuitId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    CONSTRAINT "CircuitExercise_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CircuitExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CircuitExercise_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CircuitExercise" ("circuitId", "exerciseId", "id", "sequence") SELECT "circuitId", "exerciseId", "id", "sequence" FROM "CircuitExercise";
DROP TABLE "CircuitExercise";
ALTER TABLE "new_CircuitExercise" RENAME TO "CircuitExercise";
CREATE INDEX "CircuitExercise_circuitId_idx" ON "CircuitExercise"("circuitId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
