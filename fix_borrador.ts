import sql from './lib/db';

async function run() {
  await sql`
    UPDATE sistema_tg.tg
    SET estado = 'enviada'
    WHERE id IN (
      SELECT tg_id FROM sistema_tg.tg_propuestas WHERE activa = true
    ) AND estado = 'borrador';
  `;
  console.log('Fixed stuck borrador states.');
  process.exit(0);
}
run();
