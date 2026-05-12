import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const role = (session.user as any).role ?? null;
    return NextResponse.json({ role });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}