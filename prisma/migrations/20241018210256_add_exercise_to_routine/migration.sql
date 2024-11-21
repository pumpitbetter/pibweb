-- CreateTable
CREATE TABLE "CircuitExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circuitId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    CONSTRAINT "CircuitExercise_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CircuitExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Circuit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routineId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    CONSTRAINT "Circuit_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CircuitExercise_circuitId_idx" ON "CircuitExercise"("circuitId");

-- CreateIndex
CREATE INDEX "Circuit_routineId_idx" ON "Circuit"("routineId");
