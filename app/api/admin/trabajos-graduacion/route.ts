import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session?.user as any)?.role !== 'administrador') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    // Assuming the table 'tg' was updated to use carrera_id and facultad_id like usuarios.
    // If it still uses varchar, the JOINs will gracefully fail or we can coalesce.
    // Let's try to query the new IDs if they exist.
    const trabajos = await sql`
      SELECT 
        t.id,
        t.titulo,
        t.tipo,
        t.estado,
        t.fecha_envio,
        a.nombre_completo as asesor_nombre,
        c.nombre_completo as coordinador_nombre
        -- Si carrera_id y facultad_id existen en tg:
        -- , fac.nombre as facultad_nombre, car.nombre as carrera_nombre
      FROM sistema_tg.tg t
      LEFT JOIN sistema_tg.usuarios a ON t.asesor_id = a.id
      LEFT JOIN sistema_tg.usuarios c ON t.coordinador_id = c.id
      ORDER BY t.fecha_envio DESC NULLS LAST
    `;

    return NextResponse.json({ trabajos });
  } catch (error) {
    console.error('Error fetching trabajos:', error);
    return NextResponse.json({ error: 'Error al obtener trabajos de graduación' }, { status: 500 });
  }
}
