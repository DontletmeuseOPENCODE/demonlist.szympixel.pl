import { NextResponse } from 'next/server';
import { addVictor } from '@/lib/yaml';

export async function POST(request: Request) {
  try {
    const { demon_id, player, link, date, isVerifier, progress } = await request.json();

    if (!demon_id || !player || (!link && !isVerifier)) {
      return NextResponse.json({ error: 'Brakuje pól: demon_id, player, link' }, { status: 400 });
    }

    // Progress opcjonalny — jeśli podany, musi być 80..100
    let progressNum: number | undefined = undefined;
    if (progress !== undefined && progress !== null && progress !== '') {
      progressNum = Number(progress);
      if (!Number.isFinite(progressNum) || progressNum < 80 || progressNum > 100) {
        return NextResponse.json({ error: 'Progress musi być liczbą od 80 do 100' }, { status: 400 });
      }
    }

    const updated = addVictor(Number(demon_id), {
      player,
      link: link || '',
      date: date || new Date().toISOString().split('T')[0],
      isVerifier: !!isVerifier,
      progress: progressNum,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Nie znaleziono demona' }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}
