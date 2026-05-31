import sql from './lib/db';

async function run() {
  const res = await sql`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'estado_propuesta'`;
  console.log('estado_propuesta:', res);
  
  const res2 = await sql`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'estado_propuestas'`;
  console.log('estado_propuestas:', res2);
  process.exit(0);
}
run();
