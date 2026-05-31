import sql from './lib/db';

async function testPUT() {
  const tgId = 1;
  const action = 'approve';
  const titulo_aprobado = 'Proyecto Espacios Comerciales';
  const motivo_rechazo = '';

  try {
    if (action === 'approve') {
      await sql`UPDATE sistema_tg.tg_propuestas SET estado = 'aprobada' WHERE tg_id = ${tgId} AND activa = true`;
      await sql`
        UPDATE sistema_tg.tg 
        SET estado = 'en_progreso', titulo = ${titulo_aprobado || 'Proyecto Aprobado'}, fecha_inicio = CURRENT_DATE 
        WHERE id = ${tgId}
      `;
      console.log('Approve queries executed fine directly!');
    }
  } catch (error: any) {
    console.error('Approve failed directly:', error.message);
  }
}
testPUT();
