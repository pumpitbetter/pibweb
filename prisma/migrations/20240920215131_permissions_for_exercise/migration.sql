--- new permissions for exercise resource ---
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1h1','create','exercise','own','',1696625465533,1696625465533);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1h2','create','exercise','any','',1696625465534,1696625465534);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1h3','read','exercise','own','',1696625465535,1696625465535);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1h4','read','exercise','any','',1696625465535,1696625465535);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1h5','update','exercise','own','',1696625465536,1696625465536);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1h6','update','exercise','any','',1696625465536,1696625465536);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1h7','delete','exercise','own','',1696625465537,1696625465537);
INSERT INTO Permission VALUES('cm1b8xsp9000008mkh69ec1h8','delete','exercise','any','',1696625465538,1696625465538);

--- admin's permissions for `exercise` set to `any` ---
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1h2','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1h4','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1h6','clnf2zvlw000gpcour6dyyuh6');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1h8','clnf2zvlw000gpcour6dyyuh6');

--- users's permissions for `exercise` set to `own`: 
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1h1','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1h3','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1h5','clnf2zvlx000hpcou5dfrbegs');
INSERT INTO _PermissionToRole VALUES('cm1b8xsp9000008mkh69ec1h7','clnf2zvlx000hpcou5dfrbegs');
