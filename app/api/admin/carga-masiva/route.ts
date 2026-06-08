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
        // Aceptamos password_hash o password en texto plano
        const rawPassword = row.password_hash || row.password;
        if (!row.correo || !row.nombre_completo || !rawPassword || !row.rol) continue;
        
        let finalHash = rawPassword;
        if (!rawPassword.startsWith('$2')) {
          finalHash = await bcrypt.hash(rawPassword, 10);
        }
        
        const activo = row.activo === 'false' || row.activo === '0' || row.activo?.toLowerCase() === 'falso' ? false : true;
        const carrera_id = row.carrera_id ? parseInt(row.carrera_id) : null;
        const facultad_id = row.facultad_id ? parseInt(row.facultad_id) : null;
        
        await sql`
          INSERT INTO sistema_tg.usuarios 
            (nombre_completo, correo, password_hash, rol, carnet, carrera_id, facultad_id, activo, estado)
          VALUES 
            (${row.nombre_completo}, ${row.correo}, ${finalHash}, ${row.rol}, ${row.carnet || null}, ${carrera_id}, ${facultad_id}, ${activo}, ${row.estado || 'Activo'})
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
      for (const row of datos) {
        if (!row.titulo || !row.tipo || !row.carrera_id || !row.facultad_id) continue;
        
        const asesor_id = row.asesor_id ? parseInt(row.asesor_id) : null;
        const coordinador_id = row.coordinador_id ? parseInt(row.coordinador_id) : null;
        const carrera_id = parseInt(row.carrera_id);
        const facultad_id = parseInt(row.facultad_id);
        
        // Asumiendo que tg.carrera y tg.facultad han sido migrados a carrera_id y facultad_id
        const tgRes = await sql`
          INSERT INTO sistema_tg.tg 
            (titulo, asesor_id, coordinador_id, tipo, estado, carrera_id, facultad_id, fecha_inicio, fecha_fin)
          VALUES 
            (${row.titulo}, ${asesor_id}, ${coordinador_id}, ${row.tipo}, ${row.estado || 'finalizada'}, ${carrera_id}, ${facultad_id}, ${row.fecha_inicio ? new Date(row.fecha_inicio) : null}, ${row.fecha_fin ? new Date(row.fecha_fin) : null})
          RETURNING id
        `;
        
        const newTgId = tgRes[0].id;
        
        if (row.estudiantes_carnets) {
          const carnets = row.estudiantes_carnets.split(',').map((c: string) => c.trim()).filter((c: string) => c);
          
          for (const carnet of carnets) {
            const userRes = await sql`SELECT id FROM sistema_tg.usuarios WHERE carnet = ${carnet} LIMIT 1`;
            if (userRes.length > 0) {
              await sql`
                INSERT INTO sistema_tg.tg_egresados (tg_id, egresado_id, rol_grupo, estado_participacion)
                VALUES (${newTgId}, ${userRes[0].id}, 'integrante', 'finalizado')
                ON CONFLICT (tg_id, egresado_id) DO NOTHING
              `;
            }
          }
        }
        
        insertados++;
      }
    }

    return NextResponse.json({ success: true, insertados });
  } catch (error: any) {
    console.error('Error en carga masiva:', error);
    return NextResponse.json({ error: 'Error de base de datos. Verifica IDs foráneos o valores duplicados.' }, { status: 500 });
  }
}
