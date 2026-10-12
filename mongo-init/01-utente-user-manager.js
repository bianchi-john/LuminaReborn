// Run by MongoDB only on first start (empty data volume): creates the user
// the user-manager connects to its own database with, with read and write
// permissions on that database only (least privilege).
const nomeDb = process.env.MONGO_APP_DB || 'user_manager';
const appDb = db.getSiblingDB(nomeDb);
appDb.createUser({
  user: process.env.MONGO_APP_USERNAME,
  pwd: process.env.MONGO_APP_PASSWORD,
  roles: [{ role: 'readWrite', db: nomeDb }],
});
print(`User ${process.env.MONGO_APP_USERNAME} created on ${nomeDb}`);
