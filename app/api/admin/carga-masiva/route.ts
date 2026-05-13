import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session?.user as any)?.role !== 'administrador') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { tipo, datos } = await req.json();

    if (!tipo || !datos || !Array.isArray(datos)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    let insertados = 0;

    if (tipo === 'facultades') {
      for (const row of datos) {
        if (!row.nombre || !row.codigo) continue;
        const activa = row.activa === 'false' || row.activa === '0' || row.activa?.toLowerCase() === 'falso' ? false : true;
        
        await sql`
          INSERT INTO sistema_tg.facultades (nombre, codigo, activa)
          VALUES (${row.nombre}, ${row.codigo}, ${activa})
          ON CONFLICT (codigo) DO UPDATE 
          SET nombre = EXCLUDED.nombre, activa = EXCLUDED.activa
        `;
        insertados++;
      }
    } 
    else if (tipo === 'carreras') {
      for (const row of datos) {
        if (!row.nombre || !row.codigo || !row.facultad_id) continue;
        const activa = row.activa === 'false' || row.activa === '0' || row.activa?.toLowerCase() === 'falso' ? false : true;
        const facultad_id = parseInt(row.facultad_id);
        
        await sql`
          INSERT INTO sistema_tg.carreras (nombre, codigo, facultad_id, activa)
          VALUES (${row.nombre}, ${row.codigo}, ${facultad_id}, ${activa})
          ON CONFLICT (codigo) DO UPDATE 
          SET nombre = EXCLUDED.nombre, facultad_id = EXCLUDED.facultad_id, activa = EXCLUDED.activa
        `;
        insertados++;
      }
    }
    else if (tipo === 'usuarios') {
      for (const row of datos) {
        if (!row.correo || !row.nombre_completo || !row.password_hash || !row.rol) continue;
        
        const activo = row.activo === 'false' || row.activo === '0' || row.activo?.toLowerCase() === 'falso' ? false : true;
        const carrera_id = row.carrera_id ? parseInt(row.carrera_id) : null;
        const facultad_id = row.facultad_id ? parseInt(row.facultad_id) : null;
        
        await sql`
          INSERT INTO sistema_tg.usuarios 
            (nombre_completo, correo, password_hash, rol, carnet, carrera_id, facultad_id, activo, estado)
          VALUES 
            (${row.nombre_completo}, ${row.correo}, ${row.password_hash}, ${row.rol}, ${row.carnet || null}, ${carrera_id}, ${facultad_id}, ${activo}, ${row.estado || 'Activo'})
          ON CONFLICT (correo) DO UPDATE 
          SET nombre_completo = EXCLUDED.nombre_completo,
              rol = EXCLUDED.rol,
              carnet = EXCLUDED.carnet,
              carrera_id = EXCLUDED.carrera_id,
              facultad_id = EXCLUDED.facultad_id,
              activo = EXCLUDED.activo,
              estado = EXCLUDED.estado
        `;
        // Nota: Si en Neon tu restricción unique es para el 'correo', esto hará un upsert por correo.
        insertados++;
      }
    }
    else if (tipo === 'temas') {
      // Implementación futura si decides hacer Temas Históricos
    }

    return NextResponse.json({ success: true, insertados });
  } catch (error: any) {
    console.error('Error en carga masiva:', error);
    return NextResponse.json({ error: 'Error de base de datos. Verifica IDs foráneos o valores duplicados.' }, { status: 500 });
  }
}
