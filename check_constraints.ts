import sql from './lib/db';

async function run() {
  try {
    const res = await sql`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'sistema_tg.tg_egresados'::regclass;
    `;
    console.log(res);
  } catch (err) {
    console.error(err);
  }
}
run();
