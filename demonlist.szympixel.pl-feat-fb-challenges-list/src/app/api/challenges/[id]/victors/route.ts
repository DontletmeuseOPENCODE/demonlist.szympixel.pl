import { NextResponse } from 'next/server';
import { addChallengeVictor, deleteChallengeVictor } from '@/lib/yaml';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { player, link, date, isVerifier } = body;

    if (!player || !date) {
      return NextResponse.json({ error: 'Brakuje wymaganych pól: player, date' }, { status: 400 });
    }

    const updated = addChallengeVictor(Number(id), {
      player,
      link: link || '',
      date,
      ...(isVerifier ? { isVerifier: true } : {}),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Nie znaleziono challenge' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Błąd dodawania victora' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { player } = body;

    if (!player) {
      return NextResponse.json({ error: 'Brakuje pola: player' }, { status: 400 });
    }

    const updated = deleteChallengeVictor(Number(id), player);
    if (!updated) {
      return NextResponse.json({ error: 'Nie znaleziono challenge' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Błąd usuwania victora' }, { status: 500 });
  }
}
