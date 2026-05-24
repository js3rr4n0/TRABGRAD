import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session?.user as any)?.role !== 'administrador') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const [resUsuariosActivos, resAsesores, resFacultades, resCarreras] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM sistema_tg.usuarios WHERE activo = true`,
      sql`SELECT COUNT(*) as count FROM sistema_tg.usuarios WHERE rol = 'asesor'`,
      sql`SELECT COUNT(*) as count FROM sistema_tg.facultades`,
      sql`SELECT COUNT(*) as count FROM sistema_tg.carreras`
    ]);

    return NextResponse.json({
      usuariosActivos: parseInt(resUsuariosActivos[0].count) || 0,
      asesores: parseInt(resAsesores[0].count) || 0,
      facultades: parseInt(resFacultades[0].count) || 0,
      carreras: parseInt(resCarreras[0].count) || 0,
    });
  } catch (error) {
    console.error('Error fetching estadisticas:', error);
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
  }
}
