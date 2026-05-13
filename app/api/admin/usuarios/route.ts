import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Verificación de sesión y rol
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    
    if (!session || userRole !== 'administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener los usuarios de la base de datos
    const usuarios = await sql`
      SELECT 
        u.id, 
        u.nombre_completo, 
        u.correo, 
        u.rol, 
        u.activo, 
        u.ultimo_acceso,
        f.nombre as facultad_nombre,
        c.nombre as carrera_nombre
      FROM sistema_tg.usuarios u
      LEFT JOIN sistema_tg.facultades f ON u.facultad_id = f.id
      LEFT JOIN sistema_tg.carreras c ON u.carrera_id = c.id
      ORDER BY u.fecha_creacion DESC
    `;

    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error al obtener los usuarios' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    
    if (!session || userRole !== 'administrador') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { nombre_completo, correo, password, rol, carnet, carrera_id, activo } = await req.json();

    if (!nombre_completo || !correo || !password || !rol) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Hashear la contraseña temporal
    const password_hash = await bcrypt.hash(password, 10);

    // Obtener la facultad_id a partir de la carrera_id
    let facultad_id = null;
    if (carrera_id) {
      const resultCarrera = await sql`SELECT facultad_id FROM sistema_tg.carreras WHERE id = ${carrera_id} LIMIT 1`;
      if (resultCarrera.length > 0) {
        facultad_id = resultCarrera[0].facultad_id;
      }
    }

    const result = await sql`
      INSERT INTO sistema_tg.usuarios 
        (nombre_completo, correo, password_hash, rol, carnet, carrera_id, facultad_id, activo)
      VALUES 
        (${nombre_completo}, ${correo}, ${password_hash}, ${rol}, ${carnet || null}, ${carrera_id || null}, ${facultad_id}, ${activo ?? true})
      RETURNING id, nombre_completo, correo, rol
    `;

    return NextResponse.json({ usuario: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    // Verificar si es error de constraint unique
    if (error.code === '23505') {
      if (error.message.includes('correo')) return NextResponse.json({ error: 'El correo ya está registrado.' }, { status: 400 });
      if (error.message.includes('carnet')) return NextResponse.json({ error: 'El carnet ya está registrado.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al crear el usuario' }, { status: 500 });
  }
}

