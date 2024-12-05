/*
  Warnings:

  - You are about to alter the column `sequence` on the `Circuit` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `sequence` on the `CircuitExercise` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Circuit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routineId" TEXT NOT NULL,
    "sequence" REAL NOT NULL,
    CONSTRAINT "Circuit_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Circuit" ("id", "routineId", "sequence") SELECT "id", "routineId", "sequence" FROM "Circuit";
DROP TABLE "Circuit";
ALTER TABLE "new_Circuit" RENAME TO "Circuit";
CREATE INDEX "Circuit_routineId_idx" ON "Circuit"("routineId");
CREATE TABLE "new_CircuitExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circuitId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "sequence" REAL NOT NULL,
    CONSTRAINT "CircuitExercise_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CircuitExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CircuitExercise_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CircuitExercise" ("circuitId", "exerciseId", "id", "routineId", "sequence") SELECT "circuitId", "exerciseId", "id", "routineId", "sequence" FROM "CircuitExercise";
DROP TABLE "CircuitExercise";
ALTER TABLE "new_CircuitExercise" RENAME TO "CircuitExercise";
CREATE INDEX "CircuitExercise_circuitId_idx" ON "CircuitExercise"("circuitId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
