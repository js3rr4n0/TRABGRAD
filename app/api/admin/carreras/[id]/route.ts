import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || (session?.user as any)?.role !== 'administrador') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const result = await sql`
      DELETE FROM sistema_tg.carreras 
      WHERE id = ${params.id}
      RETURNING id
    `;

    if (result.length === 0) return NextResponse.json({ error: 'Carrera no encontrada' }, { status: 404 });

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (error: any) {
    if (error.code === '23503') return NextResponse.json({ error: 'No se puede eliminar la carrera porque tiene usuarios asignados.' }, { status: 400 });
    return NextResponse.json({ error: 'Error al eliminar la carrera' }, { status: 500 });
  }
}
