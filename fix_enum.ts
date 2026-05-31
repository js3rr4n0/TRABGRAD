import sql from './lib/db';

async function run() {
  try {
    // Para ver los valores actuales
    console.log('Agregando el valor "invitado" al enum estado_participacion_tg...');
    await sql`ALTER TYPE sistema_tg.estado_participacion_tg ADD VALUE IF NOT EXISTS 'invitado'`;
    console.log('¡Valor agregado exitosamente!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
