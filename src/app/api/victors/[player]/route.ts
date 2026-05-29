import { NextResponse } from 'next/server';
import { deleteVictor } from '@/lib/yaml';

interface Params {
  params: Promise<{ player: string }>;
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { player } = await params;
    const { demon_id } = await request.json();

    if (!demon_id) {
      return NextResponse.json({ error: 'Brakuje demon_id' }, { status: 400 });
    }

    const updated = deleteVictor(Number(demon_id), decodeURIComponent(player));
    if (!updated) {
      return NextResponse.json({ error: 'Nie znaleziono demona' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}
