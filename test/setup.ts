// Variabili minime per caricare la configurazione nei test (nessuna connessione reale)
process.env.DB_USER ??= 'test';
process.env.DB_PASSWORD ??= 'test';
process.env.NODE_ENV ??= 'test';
