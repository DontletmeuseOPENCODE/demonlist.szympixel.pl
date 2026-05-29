import { NextResponse } from 'next/server';
import { getDemonById, updateDemon, deleteDemon } from '@/lib/yaml';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const demon = getDemonById(Number(id));
  if (!demon) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
  return NextResponse.json(demon);
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateDemon(Number(id), body);
    if (!updated) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const ok = deleteDemon(Number(id));
  if (!ok) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
