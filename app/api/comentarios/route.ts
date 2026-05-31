import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const tg_id = searchParams.get('tg_id');
    
    if (!tg_id) return NextResponse.json({ error: 'Falta tg_id' }, { status: 400 });

    // Fetch comentarios
    const comentarios = await sql`
      SELECT c.id, c.mensaje, c.archivo_url, c.creado_en, u.nombre_completo, u.rol
      FROM sistema_tg.tg_comentarios c
      JOIN sistema_tg.usuarios u ON c.usuario_id = u.id
      WHERE c.tg_id = ${tg_id}
      ORDER BY c.creado_en ASC
    `;

    return NextResponse.json(comentarios);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener comentarios' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const userId = parseInt((session.user as any).id);

    const formData = await req.formData();
    const tg_id = formData.get('tg_id') as string;
    const mensaje = formData.get('mensaje') as string;
    const file = formData.get('archivo') as File | null;

    if (!tg_id || (!mensaje && !file)) {
      return NextResponse.json({ error: 'Mensaje o archivo requerido' }, { status: 400 });
    }

    let fileUrl = null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${fileName}`;
    }

    const res = await sql`
      INSERT INTO sistema_tg.tg_comentarios (tg_id, usuario_id, mensaje, archivo_url)
      VALUES (${tg_id}, ${userId}, ${mensaje || ''}, ${fileUrl})
      RETURNING id, mensaje, archivo_url, creado_en
    `;

    // Fetch el nombre y rol para devolverlo en la respuesta y actualizar el UI
    const userInfo = await sql`SELECT nombre_completo, rol FROM sistema_tg.usuarios WHERE id = ${userId}`;

    return NextResponse.json({
      ...res[0],
      nombre_completo: userInfo[0].nombre_completo,
      rol: userInfo[0].rol
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno al enviar mensaje' }, { status: 500 });
  }
}
