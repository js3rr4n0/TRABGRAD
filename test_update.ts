import sql from './lib/db';

async function run() {
  try {
    const a = await sql`
      SELECT u.id, u.nombre_completo, 
      (SELECT COUNT(*) FROM sistema_tg.tg WHERE asesor_id = u.id AND estado = 'en_progreso') as tg_activos 
      FROM sistema_tg.usuarios u 
      WHERE u.rol = 'asesor' AND u.activo = true
    `;
    console.log(a);
  } catch (e: any) {
    console.error('DB ERROR:', e.message);
  }
  process.exit(0);
}
run();
