import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || (session?.user as any)?.role !== 'administrador') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const result = await sql`
      DELETE FROM sistema_tg.facultades 
      WHERE id = ${params.id}
      RETURNING id
    `;

    if (result.length === 0) return NextResponse.json({ error: 'Facultad no encontrada' }, { status: 404 });

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (error: any) {
    if (error.code === '23503') return NextResponse.json({ error: 'No se puede eliminar la facultad porque tiene carreras asignadas.' }, { status: 400 });
    return NextResponse.json({ error: 'Error al eliminar la facultad' }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || (session?.user as any)?.role !== 'administrador') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();
    const { nombre, codigo } = body;

    if (!nombre || !codigo) return NextResponse.json({ error: 'Nombre y código son requeridos' }, { status: 400 });

    const result = await sql`
      UPDATE sistema_tg.facultades 
      SET nombre = ${nombre}, codigo = ${codigo}
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (result.length === 0) return NextResponse.json({ error: 'Facultad no encontrada' }, { status: 404 });

    return NextResponse.json({ success: true, facultad: result[0] });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar la facultad' }, { status: 500 });
  }
}
