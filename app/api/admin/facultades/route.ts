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

    const facultades = await sql`
      SELECT id, nombre, codigo, activa, fecha_creacion
      FROM sistema_tg.facultades
      ORDER BY id ASC
    `;

    return NextResponse.json({ facultades });
  } catch (error) {
    console.error('Error fetching facultades:', error);
    return NextResponse.json({ error: 'Error al obtener facultades. Es posible que las tablas no existan aún.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    
    if (!session || userRole !== 'administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { nombre, codigo, activa } = await req.json();

    if (!nombre || !codigo) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO sistema_tg.facultades (nombre, codigo, activa)
      VALUES (${nombre}, ${codigo}, ${activa ?? true})
      RETURNING *
    `;

    return NextResponse.json({ facultad: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating facultad:', error);
    return NextResponse.json({ error: 'Error al crear facultad' }, { status: 500 });
  }
}
