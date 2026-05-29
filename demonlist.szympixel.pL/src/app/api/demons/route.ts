import { NextResponse } from 'next/server';
import { readDemons, addDemon } from '@/lib/yaml';

export async function GET() {
  try {
    const demons = readDemons();
    return NextResponse.json(demons);
  } catch {
    return NextResponse.json({ error: 'Błąd odczytu danych' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, creator, level_id, video, thumbnail, rank } = body;

    if (!name || !creator || !rank) {
      return NextResponse.json({ error: 'Brakuje wymaganych pól: name, creator, rank' }, { status: 400 });
    }

    const newDemon = addDemon({
      name,
      creator,
      level_id: Number(level_id) || 0,
      video: video || '',
      thumbnail: thumbnail || '',
      rank: Number(rank),
      added_at: new Date().toISOString().split('T')[0],
      victors: [],
    });

    return NextResponse.json(newDemon, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu danych' }, { status: 500 });
  }
}
