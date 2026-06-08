import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const userId = (session.user as any).id;
    if (!userId) return NextResponse.json({ error: 'ID no encontrado' }, { status: 400 });

    const rows = await sql`SELECT carnet FROM sistema_tg.usuarios WHERE id = ${userId}`;
    
    if (rows.length === 0) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    return NextResponse.json({ carnet: rows[0].carnet });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}