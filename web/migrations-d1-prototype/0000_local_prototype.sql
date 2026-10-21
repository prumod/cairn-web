-- Disposable local D1 prototype schema. Not an approved production migration.
CREATE TABLE user (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, emailVerified INTEGER NOT NULL DEFAULT 0, image TEXT, createdAt INTEGER NOT NULL DEFAULT (unixepoch()*1000), updatedAt INTEGER NOT NULL DEFAULT (unixepoch()*1000));
CREATE TABLE session (id TEXT PRIMARY KEY NOT NULL, expiresAt INTEGER NOT NULL, token TEXT NOT NULL UNIQUE, createdAt INTEGER NOT NULL DEFAULT (unixepoch()*1000), updatedAt INTEGER NOT NULL DEFAULT (unixepoch()*1000), ipAddress TEXT, userAgent TEXT, userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE);
CREATE INDEX session_user_idx ON session(userId);
CREATE TABLE account (id TEXT PRIMARY KEY NOT NULL, accountId TEXT NOT NULL, providerId TEXT NOT NULL, userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, accessToken TEXT, refreshToken TEXT, idToken TEXT, accessTokenExpiresAt INTEGER, refreshTokenExpiresAt INTEGER, scope TEXT, password TEXT, createdAt INTEGER NOT NULL DEFAULT (unixepoch()*1000), updatedAt INTEGER NOT NULL DEFAULT (unixepoch()*1000));
CREATE INDEX account_user_idx ON account(userId);
CREATE TABLE verification (id TEXT PRIMARY KEY NOT NULL, identifier TEXT NOT NULL, value TEXT NOT NULL, expiresAt INTEGER NOT NULL, createdAt INTEGER NOT NULL DEFAULT (unixepoch()*1000), updatedAt INTEGER NOT NULL DEFAULT (unixepoch()*1000));
CREATE INDEX verification_identifier_idx ON verification(identifier);
CREATE TABLE user_access (user_id TEXT PRIMARY KEY NOT NULL REFERENCES user(id) ON DELETE CASCADE, administrator INTEGER NOT NULL DEFAULT 0, approved INTEGER NOT NULL DEFAULT 0);
CREATE TABLE company_profile (id INTEGER PRIMARY KEY DEFAULT 1 NOT NULL, name TEXT NOT NULL, address TEXT NOT NULL, radius_km REAL NOT NULL, CONSTRAINT one_company_profile CHECK (id=1), CONSTRAINT positive_finite_radius CHECK (radius_km>0 AND radius_km<=1.7976931348623157e308));
