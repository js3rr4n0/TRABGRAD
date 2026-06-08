import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    
    if (!session || userRole !== 'administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const carreras = await sql`
      SELECT c.id, c.nombre, c.codigo, c.activa, c.fecha_creacion, c.facultad_id, f.nombre as facultad_nombre,
             (SELECT COUNT(*) FROM sistema_tg.usuarios u WHERE u.carrera_id = c.id) as num_usuarios
      FROM sistema_tg.carreras c
      LEFT JOIN sistema_tg.facultades f ON c.facultad_id = f.id
      ORDER BY c.id ASC
    `;

    return NextResponse.json({ carreras });
  } catch (error) {
    console.error('Error fetching carreras:', error);
    return NextResponse.json({ error: 'Error al obtener carreras' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    
    if (!session || userRole !== 'administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { nombre, codigo, facultad_id, activa } = await req.json();

    if (!nombre || !codigo || !facultad_id) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO sistema_tg.carreras (nombre, codigo, facultad_id, activa)
      VALUES (${nombre}, ${codigo}, ${facultad_id}, ${activa ?? true})
      RETURNING *
    `;

    return NextResponse.json({ carrera: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating carrera:', error);
    return NextResponse.json({ error: 'Error al crear carrera' }, { status: 500 });
  }
}
