import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';

// OBTENER un usuario específico para editar
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || (session?.user as any)?.role !== 'administrador') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const usuario = await sql`
      SELECT id, nombre_completo, correo, rol, carnet, carrera_id, facultad_id, activo 
      FROM sistema_tg.usuarios 
      WHERE id = ${params.id}
    `;

    if (usuario.length === 0) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    return NextResponse.json({ usuario: usuario[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 });
  }
}

// ACTUALIZAR (Toggle Activo o campos parciales)
export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || (session?.user as any)?.role !== 'administrador') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();
    
    if (typeof body.activo !== 'undefined') {
      const result = await sql`
        UPDATE sistema_tg.usuarios 
        SET activo = ${body.activo} 
        WHERE id = ${params.id} 
        RETURNING id, activo
      `;
      return NextResponse.json({ usuario: result[0] });
    }

    return NextResponse.json({ error: 'No se envió información para actualizar' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

// ACTUALIZAR información completa (Edit)
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || (session?.user as any)?.role !== 'administrador') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { nombre_completo, correo, rol, carnet, carrera_id, activo } = await req.json();

    let facultad_id = null;
    if (carrera_id) {
      const resultCarrera = await sql`SELECT facultad_id FROM sistema_tg.carreras WHERE id = ${carrera_id} LIMIT 1`;
      if (resultCarrera.length > 0) facultad_id = resultCarrera[0].facultad_id;
    }

    const result = await sql`
      UPDATE sistema_tg.usuarios 
      SET 
        nombre_completo = ${nombre_completo},
        correo = ${correo},
        rol = ${rol},
        carnet = ${carnet || null},
        carrera_id = ${carrera_id || null},
        facultad_id = ${facultad_id},
        activo = ${activo}
      WHERE id = ${params.id}
      RETURNING id
    `;

    return NextResponse.json({ success: true, usuario: result[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      if (error.message.includes('correo')) return NextResponse.json({ error: 'El correo ya está registrado.' }, { status: 400 });
      if (error.message.includes('carnet')) return NextResponse.json({ error: 'El carnet ya está registrado.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

// ELIMINAR un usuario (Delete)
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || (session?.user as any)?.role !== 'administrador') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const result = await sql`
      DELETE FROM sistema_tg.usuarios 
      WHERE id = ${params.id}
      RETURNING id
    `;

    if (result.length === 0) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar el usuario' }, { status: 500 });
  }
}
