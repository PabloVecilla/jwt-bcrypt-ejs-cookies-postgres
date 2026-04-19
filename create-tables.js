require("dotenv").config();

const inputUrl = process.argv[2] || process.env.DATABASE_URL;

if (!inputUrl) {
  // eslint-disable-next-line no-console
  console.error("Falta DATABASE_URL. Uso: node create-tables.js \"postgresql://...\"");
  return;
}

process.env.DATABASE_URL = inputUrl;

const sequelize = require("./src/db");
require("./src/models");

async function createTables() {
  try {
    // authenticate valida la conexion; sync crea las tablas/modelos que no existan.
    await sequelize.authenticate();
    await sequelize.sync();
    // eslint-disable-next-line no-console
    console.log("Tablas creadas (o ya existentes) en PostgreSQL");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creando tablas:", error.message || error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

createTables();
