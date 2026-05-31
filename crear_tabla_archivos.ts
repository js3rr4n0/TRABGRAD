import sql from './lib/db';

async function run() {
  try {
    console.log('Creando tabla de archivos...');
    await sql`
      CREATE TABLE IF NOT EXISTS sistema_tg.archivos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        tipo_mime VARCHAR(100) NOT NULL,
        datos BYTEA NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('¡Tabla archivos creada exitosamente!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
