import { NextResponse } from 'next/server';
import { readSubmissions, addSubmission } from '@/lib/yaml';
import { getYouTubeThumbnail, getYouTubeId } from '@/lib/youtube';

export async function GET() {
  try {
    const submissions = readSubmissions();
    return NextResponse.json(submissions);
  } catch {
    return NextResponse.json({ error: 'Błąd odczytu danych' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, creator, level_id, video, thumbnail, rank } = body;

    // Validate required fields
    if (!name || !creator || !rank || !video) {
      return NextResponse.json({ error: 'Brakuje wymaganych pól: name, creator, rank, video' }, { status: 400 });
    }

    // Validate YouTube video URL and extract ID
    const videoId = getYouTubeId(video);
    if (!videoId) {
      return NextResponse.json({ error: 'Nieprawidłowy link wideo YouTube' }, { status: 400 });
    }

    let finalThumbnail = thumbnail || '';
    if (!finalThumbnail && video) {
        const derived = getYouTubeThumbnail(video);
        finalThumbnail = derived || '';
    }

    const newSubmission = addSubmission({
      name,
      creator,
      level_id: Number(level_id) || 0,
      video: video || '',
      thumbnail: finalThumbnail,
      rank: Number(rank),
      submitted_at: new Date().toISOString().split('T')[0],
      status: 'pending',
    });

    return NextResponse.json(newSubmission, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Błąd zapisu danych' }, { status: 500 });
  }
}
