import { NextResponse } from 'next/server';
import { readDemons, addDemon } from '@/lib/yaml';
import { getYouTubeThumbnail, getNewgroundsSongId } from '@/lib/youtube';

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

    let finalThumbnail = thumbnail || '';
    if (!finalThumbnail && video) {
      finalThumbnail = getYouTubeThumbnail(video) || '';
    }

    const newDemon = addDemon({
      name,
      creator,
      level_id: Number(level_id) || 0,
      video: video || '',
      thumbnail: finalThumbnail,
      rank: Number(rank),
      added_at: new Date().toISOString().split('T')[0],
      victors: [],
      level_password: body.level_password || '',
      level_length: body.level_length || '',
      object_count: Number(body.object_count) || 0,
      difficulty: body.difficulty || '',
      gd_version: body.gd_version || '',
      song_name: body.song_name || '',
      song_author: body.song_author || '',
      song_id: Number(body.song_id) || Number(getNewgroundsSongId(body.song_url)) || 0,
      song_url: body.song_url || '',
    });

    return NextResponse.json(newDemon, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu danych' }, { status: 500 });
  }
}
