// Eseguito da MongoDB solo al primo avvio (volume dei dati vuoto): crea l'utente
// con cui lo user-manager accede al proprio database, con i soli permessi di
// lettura e scrittura su quel database (minimo privilegio).
const nomeDb = process.env.MONGO_APP_DB || 'user_manager';
const appDb = db.getSiblingDB(nomeDb);
appDb.createUser({
  user: process.env.MONGO_APP_USERNAME,
  pwd: process.env.MONGO_APP_PASSWORD,
  roles: [{ role: 'readWrite', db: nomeDb }],
});
print(`Utente ${process.env.MONGO_APP_USERNAME} creato su ${nomeDb}`);
