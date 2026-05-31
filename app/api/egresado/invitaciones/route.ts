import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';

// Crear una invitación
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'egresado') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const userId = parseInt((session.user as any).id);

    const { carnet, tipo } = await req.json();
    if (!carnet) return NextResponse.json({ error: 'Falta el carnet' }, { status: 400 });

    // 1. Obtener datos del líder
    const liderRes = await sql`SELECT carrera_id, facultad_id FROM sistema_tg.usuarios WHERE id = ${userId}`;
    if (liderRes.length === 0) return NextResponse.json({ error: 'Líder no encontrado' }, { status: 400 });
    const { carrera_id, facultad_id } = liderRes[0];

    // 2. Buscar al invitado por carnet
    const invitadoRes = await sql`SELECT id FROM sistema_tg.usuarios WHERE carnet = ${carnet} AND rol = 'egresado' LIMIT 1`;
    if (invitadoRes.length === 0) return NextResponse.json({ error: 'Estudiante no encontrado o no es egresado' }, { status: 404 });
    const invitadoId = invitadoRes[0].id;

    if (invitadoId === userId) return NextResponse.json({ error: 'No puedes invitarte a ti mismo' }, { status: 400 });

    // 3. Verificar que el invitado no esté ya en un grupo activo
    const invTgRes = await sql`SELECT tg_id FROM sistema_tg.tg_egresados WHERE egresado_id = ${invitadoId} AND estado_participacion IN ('activo', 'invitado') LIMIT 1`;
    if (invTgRes.length > 0) return NextResponse.json({ error: 'Este estudiante ya tiene un proyecto o una invitación pendiente' }, { status: 400 });

    // 4. Verificar si el líder ya tiene un TG activo
    let tgId = null;
    const activeTgRes = await sql`SELECT tg_id FROM sistema_tg.tg_egresados WHERE egresado_id = ${userId} AND estado_participacion = 'activo' LIMIT 1`;
    
    if (activeTgRes.length > 0) {
      tgId = activeTgRes[0].tg_id;
    } else {
      // 5. Crear TG "borrador" si el líder no tiene
      const insertTg = await sql`
        INSERT INTO sistema_tg.tg (titulo, tipo, estado, carrera_id, facultad_id)
        VALUES ('Borrador de Proyecto', ${tipo || 'proyecto'}, 'borrador', ${carrera_id}, ${facultad_id})
        RETURNING id
      `;
      tgId = insertTg[0].id;

      await sql`
        INSERT INTO sistema_tg.tg_egresados (tg_id, egresado_id, rol_grupo, estado_participacion)
        VALUES (${tgId}, ${userId}, 'lider', 'activo')
      `;
    }

    // 6. Invitar al estudiante
    await sql`
      INSERT INTO sistema_tg.tg_egresados (tg_id, egresado_id, rol_grupo, estado_participacion)
      VALUES (${tgId}, ${invitadoId}, 'integrante', 'invitado')
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

// Aceptar o Rechazar Invitación
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'egresado') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const userId = parseInt((session.user as any).id);

    const { action, tg_id } = await req.json(); // action: 'accept' | 'reject'

    if (action === 'accept') {
      await sql`
        UPDATE sistema_tg.tg_egresados 
        SET estado_participacion = 'activo' 
        WHERE egresado_id = ${userId} AND tg_id = ${tg_id} AND estado_participacion = 'invitado'
      `;
    } else if (action === 'reject') {
      await sql`
        DELETE FROM sistema_tg.tg_egresados 
        WHERE egresado_id = ${userId} AND tg_id = ${tg_id} AND estado_participacion = 'invitado'
      `;
      
      // Opcional: si el grupo queda solo con 1, y no hay propuestas, eliminar el TG si queremos limpiar.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
