import { NextResponse } from 'next/server';
import { readChallenges, addChallenge } from '@/lib/yaml';

export async function GET() {
  try {
    const challenges = readChallenges();
    return NextResponse.json(challenges);
  } catch {
    return NextResponse.json({ error: 'Błąd odczytu danych' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, creator, level_id, rank } = body;

    if (!name || !creator || !rank) {
      return NextResponse.json({ error: 'Brakuje wymaganych pól: name, creator, rank' }, { status: 400 });
    }

    const newChallenge = addChallenge({
      name,
      creator,
      level_id: Number(level_id) || 0,
      rank: Number(rank),
      added_at: new Date().toISOString().split('T')[0],
      victors: [],
    });

    return NextResponse.json(newChallenge, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu danych' }, { status: 500 });
  }
}
