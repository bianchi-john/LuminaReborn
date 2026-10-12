// Minimal variables to load the configuration in tests (no real connection)
process.env.DB_USER ??= 'test';
process.env.DB_PASSWORD ??= 'test';
process.env.NODE_ENV ??= 'test';
