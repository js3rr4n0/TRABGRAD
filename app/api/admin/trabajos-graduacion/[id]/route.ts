import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || (session?.user as any)?.role !== 'administrador') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const result = await sql`
      DELETE FROM sistema_tg.tg 
      WHERE id = ${params.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error('Error al eliminar TG:', error);
    return NextResponse.json({ error: 'Error al eliminar el trabajo de graduación' }, { status: 500 });
  }
}

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const tgId = parseInt(params.id);
    if (isNaN(tgId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    // Obtener TG principal
    const tgRes = await sql`
      SELECT t.*, c.nombre as carrera_nombre, f.nombre as facultad_nombre
      FROM sistema_tg.tg t
      LEFT JOIN sistema_tg.carreras c ON t.carrera_id = c.id
      LEFT JOIN sistema_tg.facultades f ON t.facultad_id = f.id
      WHERE t.id = ${tgId}
    `;

    if (tgRes.length === 0) return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 });

    const tg = tgRes[0];

    // Obtener estudiantes
    const equipo = await sql`
      SELECT u.id, u.nombre_completo, u.carnet, te.rol_grupo, te.estado_participacion
      FROM sistema_tg.tg_egresados te
      JOIN sistema_tg.usuarios u ON te.egresado_id = u.id
      WHERE te.tg_id = ${tgId}
    `;

    // Obtener propuesta activa
    const propuesta = await sql`
      SELECT id, descripcion, documento_url, estado, motivo_rechazo, intento_num
      FROM sistema_tg.tg_propuestas
      WHERE tg_id = ${tgId} AND activa = true
    `;

    return NextResponse.json({
      tg,
      equipo,
      propuesta: propuesta.length > 0 ? propuesta[0] : null
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const tgId = parseInt(params.id);
    const body = await req.json();
    const { action, motivo_rechazo, titulo_aprobado } = body;

    if (action === 'approve') {
      await sql`UPDATE sistema_tg.tg_propuestas SET estado = 'aprobada' WHERE tg_id = ${tgId} AND activa = true`;
      await sql`
        UPDATE sistema_tg.tg 
        SET estado = 'en_progreso', titulo = ${titulo_aprobado || 'Proyecto Aprobado'}, fecha_inicio = CURRENT_DATE 
        WHERE id = ${tgId}
      `;
    } else if (action === 'reject') {
      await sql`UPDATE sistema_tg.tg_propuestas SET estado = 'rechazada', motivo_rechazo = ${motivo_rechazo} WHERE tg_id = ${tgId} AND activa = true`;
      await sql`UPDATE sistema_tg.tg SET estado = 'borrador' WHERE id = ${tgId}`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 500 });
  }
}
