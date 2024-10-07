-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "stoppedAt" DATETIME,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    CONSTRAINT "Workout_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Workout_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Workout_ownerId_idx" ON "Workout"("ownerId");

-- CreateIndex
CREATE INDEX "Workout_ownerId_createdAt_deleted_idx" ON "Workout"("ownerId", "createdAt", "deleted");

--------------------------------- Manual Seeding --------------------------


--- new permissions for workout resource ---
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1j1','create','workout','own','',1696625465533,1696625465533);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1j2','create','workout','any','',1696625465534,1696625465534);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1j3','read','workout','own','',1696625465535,1696625465535);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1j4','read','workout','any','',1696625465535,1696625465535);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1j5','update','workout','own','',1696625465536,1696625465536);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1j6','update','workout','any','',1696625465536,1696625465536);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1j7','delete','workout','own','',1696625465537,1696625465537);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1j8','delete','workout','any','',1696625465538,1696625465538);

--- admin's permissions for `workout` set to `any` ---
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1j2','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1j4','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1j6','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1j8','clnf2zvlw000gpcour6dyyuh6');

--- users's permissions for `workout` set to `own`: 
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1j1','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1j3','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1j5','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1j7','clnf2zvlx000hpcou5dfrbegs');