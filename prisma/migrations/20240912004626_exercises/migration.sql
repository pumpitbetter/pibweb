-- CreateTable
CREATE TABLE "ExerciseType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "typeId" TEXT NOT NULL,
    "ownerId" TEXT,
    CONSTRAINT "Exercise_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ExerciseType" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Exercise_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FavoriteExercise" (
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "exerciseId"),
    CONSTRAINT "FavoriteExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FavoriteExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Exercise_ownerId_idx" ON "Exercise"("ownerId");

-- CreateIndex
CREATE INDEX "Exercise_ownerId_updatedAt_idx" ON "Exercise"("ownerId", "updatedAt");

--------------------------------- Manual Seeding --------------------------

INSERT INTO ExerciseType VALUES('strength', 'Strength');
INSERT INTO ExerciseType VALUES('cardio', 'Cardio');
INSERT INTO ExerciseType VALUES('stretching', 'Stretching');
INSERT INTO ExerciseType VALUES('balance', 'Balance');

--- cardio ---
INSERT INTO Exercise VALUES('run', 'Run', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'cardio', null);
INSERT INTO Exercise VALUES('cycle', 'Cycle', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'cardio', null);
INSERT INTO Exercise VALUES('swim', 'Swim', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'cardio', null);
INSERT INTO Exercise VALUES('treadmil', 'Treadmil', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'cardio', null);
INSERT INTO Exercise VALUES('elliptical', 'Elliptical', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'cardio', null);
INSERT INTO Exercise VALUES('spin', 'Spin', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'cardio', null);
INSERT INTO Exercise VALUES('rope-jump', 'Rope Jump', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'cardio', null);

INSERT INTO Exercise VALUES('wrestling', 'Wrestling', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'cardio', null);
INSERT INTO Exercise VALUES('bjj', 'BJJ', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'cardio', null);
INSERT INTO Exercise VALUES('mma', 'MMA', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'cardio', null);

--- stretching ---
INSERT INTO Exercise VALUES('yoga', 'Yoga', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'stretching', null);
INSERT INTO Exercise VALUES('mobility', 'Mobility', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'stretching', null);

--- strength ---
INSERT INTO Exercise VALUES('barbell-back-squat', 'Barbell Back Squat', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'strength', null);
INSERT INTO Exercise VALUES('barbell-front-squat', 'Barbell Front Squat', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'strength', null);
INSERT INTO Exercise VALUES('barbell-bench-press', 'Barbell Bench Press', 'This is exercise description, instructions perhaps.', 1696625465538, 1696625465538, 'strength', null);

