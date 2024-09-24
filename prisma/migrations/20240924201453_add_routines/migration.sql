-- CreateTable
CREATE TABLE "RoutineType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "typeId" TEXT NOT NULL,
    "ownerId" TEXT,
    CONSTRAINT "Routine_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "RoutineType" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Routine_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FavoriteRoutine" (
    "userId" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "routineId"),
    CONSTRAINT "FavoriteRoutine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FavoriteRoutine_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Routine_ownerId_idx" ON "Routine"("ownerId");

-- CreateIndex
CREATE INDEX "Routine_ownerId_updatedAt_idx" ON "Routine"("ownerId", "updatedAt");


--------------------------------- Manual Seeding --------------------------

INSERT INTO RoutineType VALUES('strength', 'Strength');
INSERT INTO RoutineType VALUES('cardio', 'Cardio');
INSERT INTO RoutineType VALUES('stretching', 'Stretching');
INSERT INTO RoutineType VALUES('balance', 'Balance');

--- new permissions for routine resource ---
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1i1','create','routine','own','',1696625465533,1696625465533);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1i2','create','routine','any','',1696625465534,1696625465534);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1i3','read','routine','own','',1696625465535,1696625465535);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1i4','read','routine','any','',1696625465535,1696625465535);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1i5','update','routine','own','',1696625465536,1696625465536);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1i6','update','routine','any','',1696625465536,1696625465536);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1i7','delete','routine','own','',1696625465537,1696625465537);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1i8','delete','routine','any','',1696625465538,1696625465538);

--- admin's permissions for `routine` set to `any` ---
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1i2','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1i4','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1i6','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1i8','clnf2zvlw000gpcour6dyyuh6');

--- users's permissions for `routine` set to `own`: 
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1i1','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1i3','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1i5','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1i7','clnf2zvlx000hpcou5dfrbegs');
