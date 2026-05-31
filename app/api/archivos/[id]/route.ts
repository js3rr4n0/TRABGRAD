import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) return new NextResponse('ID inválido', { status: 400 });

    const res = await sql`SELECT nombre, tipo_mime, datos FROM sistema_tg.archivos WHERE id = ${id} LIMIT 1`;
    if (res.length === 0) return new NextResponse('Archivo no encontrado', { status: 404 });

    const archivo = res[0];

    return new NextResponse(archivo.datos, {
      status: 200,
      headers: {
        'Content-Type': archivo.tipo_mime,
        'Content-Disposition': `inline; filename="${archivo.nombre}"`
      }
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Error interno', { status: 500 });
  }
}
