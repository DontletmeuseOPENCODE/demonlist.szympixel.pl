import { NextResponse } from 'next/server';
import { readFbChallenges, addFbChallenge } from '@/lib/fb-challenges';
import { getYouTubeThumbnail } from '@/lib/youtube';

export async function GET() {
  try {
    const challenges = readFbChallenges();
    return NextResponse.json(challenges);
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

    // Showcase (video) jest opcjonalny — jeśli nie podano, zostawiamy pusty string.
    // Thumbnail auto-generujemy tylko gdy video istnieje.
    let finalThumbnail = thumbnail || '';
    if (!finalThumbnail && video) {
      finalThumbnail = getYouTubeThumbnail(video) || '';
    }

    const newChallenge = addFbChallenge({
      name,
      creator,
      level_id: Number(level_id) || 0,
      video: video || '',
      thumbnail: finalThumbnail,
      rank: Number(rank),
      added_at: new Date().toISOString().split('T')[0],
    });

    return NextResponse.json(newChallenge, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu danych' }, { status: 500 });
  }
}