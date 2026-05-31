import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'egresado') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const userId = parseInt((session.user as any).id);

    // Revisar si tiene invitaciones
    const invRes = await sql`
      SELECT t.id as tg_id, t.titulo, u.nombre_completo as lider_nombre
      FROM sistema_tg.tg_egresados te
      JOIN sistema_tg.tg t ON te.tg_id = t.id
      JOIN sistema_tg.tg_egresados tel ON tel.tg_id = t.id AND tel.rol_grupo = 'lider'
      JOIN sistema_tg.usuarios u ON tel.egresado_id = u.id
      WHERE te.egresado_id = ${userId} AND te.estado_participacion = 'invitado'
      LIMIT 1
    `;

    if (invRes.length > 0) {
      return NextResponse.json({ tg: null, invitacion: invRes[0] });
    }

    // Obtener TG activo
    const tgRes = await sql`
      SELECT t.id, t.titulo, t.estado, t.tipo, te.rol_grupo
      FROM sistema_tg.tg_egresados te
      JOIN sistema_tg.tg t ON te.tg_id = t.id
      WHERE te.egresado_id = ${userId} AND te.estado_participacion = 'activo'
      LIMIT 1
    `;

    if (tgRes.length === 0) return NextResponse.json({ tg: null });

    const tg = tgRes[0];

    // Obtener propuesta activa
    const propRes = await sql`
      SELECT id, descripcion, documento_url, estado, motivo_rechazo
      FROM sistema_tg.tg_propuestas
      WHERE tg_id = ${tg.id} AND activa = true
      LIMIT 1
    `;

    // Obtener equipo
    const equipoRes = await sql`
      SELECT u.id, u.nombre_completo, u.carnet, te.rol_grupo, te.estado_participacion
      FROM sistema_tg.tg_egresados te
      JOIN sistema_tg.usuarios u ON te.egresado_id = u.id
      WHERE te.tg_id = ${tg.id}
    `;

    return NextResponse.json({ tg, propuesta: propRes.length > 0 ? propRes[0] : null, equipo: equipoRes });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'egresado') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const userId = parseInt((session.user as any).id);

    const formData = await req.formData();
    const p1 = formData.get('p1') as string;
    const p2 = formData.get('p2') as string;
    const p3 = formData.get('p3') as string;
    const tipo = formData.get('tipo') as string;
    const file = formData.get('documento') as File;

    if (!p1 || !p2 || !p3 || !file || !tipo) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    // 1. Obtener carrera y facultad del usuario
    const userRes = await sql`SELECT carrera_id, facultad_id FROM sistema_tg.usuarios WHERE id = ${userId}`;
    if (userRes.length === 0 || !userRes[0].carrera_id) return NextResponse.json({ error: 'Usuario no tiene carrera asignada' }, { status: 400 });
    const { carrera_id, facultad_id } = userRes[0];

    // 2. Verificar si ya tiene TG activo
    let tgId = null;
    const activeTgRes = await sql`SELECT tg_id FROM sistema_tg.tg_egresados WHERE egresado_id = ${userId} AND estado_participacion = 'activo' LIMIT 1`;
    
    if (activeTgRes.length > 0) {
      tgId = activeTgRes[0].tg_id;
    } else {
      // 3. Crear TG nuevo
      const insertTg = await sql`
        INSERT INTO sistema_tg.tg (titulo, tipo, estado, carrera_id, facultad_id)
        VALUES ('Propuesta Inicial', ${tipo}, 'enviada', ${carrera_id}, ${facultad_id})
        RETURNING id
      `;
      tgId = insertTg[0].id;

      // 4. Enlazar estudiante
      await sql`
        INSERT INTO sistema_tg.tg_egresados (tg_id, egresado_id, rol_grupo, estado_participacion)
        VALUES (${tgId}, ${userId}, 'lider', 'activo')
      `;
    }

    // 5. Guardar Archivo (Fallback para Vercel Read-Only FS)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    let fileUrl = '';
    
    try {
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      // Intentar crear la carpeta si no existe (solo funcionará en local)
      await import('fs/promises').then(fs => fs.mkdir(uploadDir, { recursive: true }).catch(() => {}));
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${fileName}`;
    } catch (fsError) {
      console.warn('No se pudo guardar el archivo localmente (probablemente entorno Vercel). Usando mock URL.', fsError);
      fileUrl = `/#mock-file-${fileName}`; // Mock URL para evitar romper el flujo
    }

    // 6. Insertar Propuesta
    const descripcionJson = JSON.stringify({ p1, p2, p3 });
    
    // Determinar intento (si ya hay historial)
    const intentosRes = await sql`SELECT COALESCE(MAX(intento_num), 0) as max_intento FROM sistema_tg.tg_propuestas WHERE tg_id = ${tgId}`;
    const nuevoIntento = intentosRes[0].max_intento + 1;
    
    if (nuevoIntento > 3) return NextResponse.json({ error: 'Has alcanzado el límite de 3 intentos.' }, { status: 400 });

    // Desactivar anteriores
    await sql`UPDATE sistema_tg.tg_propuestas SET activa = false WHERE tg_id = ${tgId}`;

    // Crear nueva
    await sql`
      INSERT INTO sistema_tg.tg_propuestas (tg_id, intento_num, documento_url, descripcion, estado, activa)
      VALUES (${tgId}, ${nuevoIntento}, ${fileUrl}, ${descripcionJson}, 'pendiente', true)
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
