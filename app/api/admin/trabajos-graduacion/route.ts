import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session?.user as any)?.role !== 'administrador') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const trabajos = await sql`
      SELECT 
        t.id,
        t.titulo,
        t.tipo,
        CASE 
          WHEN t.estado = 'borrador' AND (SELECT estado FROM sistema_tg.tg_propuestas p WHERE p.tg_id = t.id AND p.activa = true ORDER BY p.id DESC LIMIT 1) = 'rechazada' THEN 'rechazada'
          ELSE t.estado 
        END as estado,
        t.fecha_inicio,
        t.fecha_fin,
        a.nombre_completo as asesor_nombre,
        c.nombre_completo as coordinador_nombre,
        fac.nombre as facultad_nombre,
        car.nombre as carrera_nombre,
        (
          SELECT json_agg(json_build_object('nombre', u.nombre_completo, 'carnet', u.carnet))
          FROM sistema_tg.tg_egresados te
          JOIN sistema_tg.usuarios u ON te.egresado_id = u.id
          WHERE te.tg_id = t.id
        ) as estudiantes
      FROM sistema_tg.tg t
      LEFT JOIN sistema_tg.usuarios a ON t.asesor_id = a.id
      LEFT JOIN sistema_tg.usuarios c ON t.coordinador_id = c.id
      LEFT JOIN sistema_tg.facultades fac ON t.facultad_id = fac.id
      LEFT JOIN sistema_tg.carreras car ON t.carrera_id = car.id
      ORDER BY t.id DESC
    `;

    return NextResponse.json({ trabajos });
  } catch (error) {
    console.error('Error fetching trabajos:', error);
    return NextResponse.json({ error: 'Error al obtener trabajos de graduación' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session?.user as any)?.role !== 'administrador') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();
    const { titulo, tipo, estado, carrera_id, facultad_id, asesor_id, coordinador_id, estudiantes_carnets, fecha_inicio, fecha_fin } = body;

    if (!titulo || !tipo || !carrera_id || !facultad_id) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Insert TG
    const tgRes = await sql`
      INSERT INTO sistema_tg.tg 
        (titulo, tipo, estado, carrera_id, facultad_id, asesor_id, coordinador_id, fecha_inicio, fecha_fin)
      VALUES 
        (${titulo}, ${tipo}, ${estado || 'borrador'}, ${carrera_id}, ${facultad_id}, ${asesor_id || null}, ${coordinador_id || null}, ${fecha_inicio || null}, ${fecha_fin || null})
      RETURNING id
    `;
    
    const newTgId = tgRes[0].id;

    // Link students
    if (estudiantes_carnets) {
      const carnets = estudiantes_carnets.split(',').map((c: string) => c.trim()).filter((c: string) => c);
      for (const carnet of carnets) {
        const userRes = await sql`SELECT id FROM sistema_tg.usuarios WHERE carnet = ${carnet} LIMIT 1`;
        if (userRes.length > 0) {
          await sql`
            INSERT INTO sistema_tg.tg_egresados (tg_id, egresado_id, rol_grupo, estado_participacion)
            VALUES (${newTgId}, ${userRes[0].id}, 'integrante', 'activo')
            ON CONFLICT DO NOTHING
          `;
        }
      }
    }

    return NextResponse.json({ success: true, id: newTgId });
  } catch (error) {
    console.error('Error creating tg:', error);
    return NextResponse.json({ error: 'Error al crear trabajo de graduación' }, { status: 500 });
  }
}
