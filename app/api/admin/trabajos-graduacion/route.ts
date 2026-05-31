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
        t.estado,
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
