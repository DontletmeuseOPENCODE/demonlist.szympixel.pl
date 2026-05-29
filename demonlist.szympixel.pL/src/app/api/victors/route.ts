import { NextResponse } from 'next/server';
import { addVictor } from '@/lib/yaml';

export async function POST(request: Request) {
  try {
    const { demon_id, player, link, date } = await request.json();

    if (!demon_id || !player || !link) {
      return NextResponse.json({ error: 'Brakuje pól: demon_id, player, link' }, { status: 400 });
    }

    const updated = addVictor(Number(demon_id), {
      player,
      link,
      date: date || new Date().toISOString().split('T')[0],
    });

    if (!updated) {
      return NextResponse.json({ error: 'Nie znaleziono demona' }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}
